import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  Timestamp,
  writeBatch,
  setDoc,
} from "firebase/firestore";
import {
  db,
  uploadChatFile,
  getFileCategory,
  formatFileSize,
} from "./FirebaseService";

/**
 * UTILITY FUNCTIONS
 */

/**
 * Ensures the given ID is a valid string for Firestore
 * @param {*} id - The ID to validate and convert
 * @param {string} fieldName - Name of the field for error messages
 * @returns {string} The ID as a string
 * @throws {Error} If the ID is null or undefined
 */
const ensureStringId = (id, fieldName = "ID") => {
  if (id === null || id === undefined) {
    throw new Error(`${fieldName} is required and cannot be null or undefined`);
  }
  return String(id);
};

/**
 * Validates user data object
 * @param {Object} userData - User data to validate
 * @returns {Object} Validated and sanitized user data
 */
const sanitizeUserData = (userData) => {
  return {
    name: userData?.name || "",
    email: userData?.email || "",
    mobile: userData?.mobile || null,
    profile_picture: userData?.profile_picture || null,
  };
};

/**
 * CONVERSATIONS OPERATIONS
 */

/**
 * Create or get a conversation between two users
 * @param {string|number} userId1 - First user ID
 * @param {Object} user1Data - First user data (name, email, mobile, profile_picture)
 * @param {string|number} userId2 - Second user ID
 * @param {Object} user2Data - Second user data (name, email, mobile, profile_picture)
 * @returns {Promise<string>} Conversation ID
 */
export const createOrGetConversation = async (
  userId1,
  user1Data,
  userId2,
  user2Data
) => {
  try {
    // Ensure IDs are strings
    const stringId1 = ensureStringId(userId1, "User ID 1");
    const stringId2 = ensureStringId(userId2, "User ID 2");

    // Sanitize user data
    const sanitizedUser1Data = sanitizeUserData(user1Data);
    const sanitizedUser2Data = sanitizeUserData(user2Data);

    // Sort user IDs to ensure consistency (smaller ID first)
    const [sortedId1, sortedId2] = [stringId1, stringId2].sort();
    const conversationId = `${sortedId1}_${sortedId2}`;

    // Check if conversation exists
    const conversationRef = doc(db, "conversations", conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (conversationSnap.exists()) {
      console.log("✅ Conversation already exists:", conversationId);
      return conversationId;
    }

    // Create new conversation
    const conversationData = {
      participantIds: [sortedId1, sortedId2],
      participant1Id: sortedId1,
      participant2Id: sortedId2,
      participant1Name:
        stringId1 === sortedId1
          ? sanitizedUser1Data.name
          : sanitizedUser2Data.name,
      participant2Name:
        stringId1 === sortedId1
          ? sanitizedUser2Data.name
          : sanitizedUser1Data.name,
      participant1Email:
        stringId1 === sortedId1
          ? sanitizedUser1Data.email
          : sanitizedUser2Data.email,
      participant2Email:
        stringId1 === sortedId1
          ? sanitizedUser2Data.email
          : sanitizedUser1Data.email,
      participant1Mobile:
        stringId1 === sortedId1
          ? sanitizedUser1Data.mobile
          : sanitizedUser2Data.mobile,
      participant2Mobile:
        stringId1 === sortedId1
          ? sanitizedUser2Data.mobile
          : sanitizedUser1Data.mobile,
      participant1ProfilePicture:
        stringId1 === sortedId1
          ? sanitizedUser1Data.profile_picture
          : sanitizedUser2Data.profile_picture,
      participant2ProfilePicture:
        stringId1 === sortedId1
          ? sanitizedUser2Data.profile_picture
          : sanitizedUser1Data.profile_picture,
      lastMessage: null,
      lastMessageTime: Timestamp.now(),
      lastMessageSenderId: null,
      lastMessageType: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isActive: true,
      archivedBy: [],
      pinnedBy: [],
      unreadCount1: 0,
      unreadCount2: 0,
    };

    await setDoc(conversationRef, conversationData, { merge: true });
    console.log("✅ Conversation created:", conversationId);
    return conversationId;
  } catch (error) {
    console.error("❌ Error creating/getting conversation:", error);
    throw error;
  }
};

/**
 * Get all conversations for a user
 * @param {string|number} userId - User ID
 * @param {number} limitCount - Limit number of conversations (default 50)
 * @returns {Promise<Array>} Array of conversation objects
 */
export const getUserConversations = async (userId, limitCount = 50) => {
  try {
    // Ensure ID is a string
    const stringUserId = ensureStringId(userId, "User ID");

    const q = query(
      collection(db, "conversations"),
      where("participantIds", "array-contains", stringUserId),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const conversations = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort(
        (a, b) =>
          (b.lastMessageTime?.toMillis?.() || 0) -
          (a.lastMessageTime?.toMillis?.() || 0)
      );

    console.log(`✅ Fetched ${conversations.length} conversations for user`);
    return conversations;
  } catch (error) {
    console.error("❌ Error fetching conversations:", error);
    throw error;
  }
};

/**
 * Set up real-time listener for user conversations
 * @param {string|number} userId - User ID
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export const listenToUserConversations = (userId, callback) => {
  try {
    // Ensure ID is a string
    const stringUserId = ensureStringId(userId, "User ID");

    const q = query(
      collection(db, "conversations"),
      where("participantIds", "array-contains", stringUserId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const conversations = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort(
            (a, b) =>
              (b.lastMessageTime?.toMillis?.() || 0) -
              (a.lastMessageTime?.toMillis?.() || 0)
          );
        callback(conversations);
      },
      (error) => {
        console.error("❌ Firestore listener error:", error);
        // Call callback with empty array on error to avoid breaking the UI
        callback([]);
      }
    );

    console.log("✅ Real-time listener set up for conversations");
    return unsubscribe;
  } catch (error) {
    console.error("❌ Error setting up conversation listener:", error);
    throw error;
  }
};

/**
 * MESSAGES OPERATIONS
 */

/**
 * Send a message in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string|number} senderId - Sender user ID
 * @param {string} senderName - Sender name
 * @param {string} messageText - Message text content
 * @param {string} messageType - Type of message (default: "text")
 * @returns {Promise<string>} Message document ID
 */
export const sendMessage = async (
  conversationId,
  senderId,
  senderName,
  messageText,
  messageType = "text"
) => {
  try {
    // Ensure sender ID is a string
    const stringSenderId = ensureStringId(senderId, "Sender ID");

    // Validate conversation ID
    if (!conversationId || typeof conversationId !== "string") {
      throw new Error("Valid conversation ID is required");
    }

    // Create message object
    const messageData = {
      senderId: stringSenderId,
      senderName: senderName || "User",
      text: messageText || "",
      createdAt: Timestamp.now(),
      isRead: false,
      readAt: null,
      type: messageType,
      status: "sent",
      reactions: {},
    };

    // Add message to messages sub-collection
    const messagesRef = collection(
      db,
      `conversations/${conversationId}/messages`
    );
    const messageDoc = await addDoc(messagesRef, messageData);

    // Update conversation with last message info
    const conversationRef = doc(db, "conversations", conversationId);
    await setDoc(
      conversationRef,
      {
        lastMessage: (messageText || "").substring(0, 100),
        lastMessageTime: Timestamp.now(),
        lastMessageSenderId: stringSenderId,
        lastMessageType: messageType,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    console.log("✅ Message sent successfully:", messageDoc.id);
    return messageDoc.id;
  } catch (error) {
    console.error("❌ Error sending message:", error);
    throw error;
  }
};

/**
 * Send a media message in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string|number} senderId - Sender user ID
 * @param {string} senderName - Sender name
 * @param {Object} file - File object { uri, mimeType, fileName, fileSize }
 * @param {string} caption - Optional caption for the media
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<string>} Message document ID
 */
export const sendMediaMessage = async (
  conversationId,
  senderId,
  senderName,
  file,
  caption = "",
  onProgress = () => {}
) => {
  try {
    // Ensure sender ID is a string
    const stringSenderId = ensureStringId(senderId, "Sender ID");

    // Validate conversation ID
    if (!conversationId || typeof conversationId !== "string") {
      throw new Error("Valid conversation ID is required");
    }

    // Validate file
    if (!file || !file.uri) {
      throw new Error("Valid file is required");
    }

    // Generate a temporary message ID for the file path
    const tempMessageId = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Determine file type category
    const fileCategory = getFileCategory(file.mimeType);

    // Upload file to Firebase Storage
    console.log("📤 Uploading file...", file.fileName);
    const uploadResult = await uploadChatFile(
      conversationId,
      tempMessageId,
      file,
      onProgress
    );

    // Create message object with media info
    const messageData = {
      senderId: stringSenderId,
      senderName: senderName || "User",
      text: caption || "",
      createdAt: Timestamp.now(),
      isRead: false,
      readAt: null,
      type: fileCategory,
      status: "sent",
      reactions: {},
      // Media-specific fields
      media: {
        url: uploadResult.url,
        path: uploadResult.path,
        mimeType: file.mimeType || "application/octet-stream",
        fileName: file.fileName || "file",
        fileSize: file.fileSize || 0,
        fileSizeFormatted: formatFileSize(file.fileSize || 0),
        dimensions: file.dimensions || null,
        duration: file.duration || null,
        thumbnail: file.thumbnail || null,
      },
    };

    // Add message to messages sub-collection
    const messagesRef = collection(
      db,
      `conversations/${conversationId}/messages`
    );
    const messageDoc = await addDoc(messagesRef, messageData);

    // Create last message preview text based on file type
    const lastMessagePreview = getMediaPreviewText(fileCategory, caption);

    // Update conversation with last message info
    const conversationRef = doc(db, "conversations", conversationId);
    await setDoc(
      conversationRef,
      {
        lastMessage: lastMessagePreview,
        lastMessageTime: Timestamp.now(),
        lastMessageSenderId: stringSenderId,
        lastMessageType: fileCategory,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    console.log("✅ Media message sent successfully:", messageDoc.id);
    return messageDoc.id;
  } catch (error) {
    console.error("❌ Error sending media message:", error);
    throw error;
  }
};

/**
 * Get preview text for media messages (shown in conversation list)
 * @param {string} fileCategory - File category (image, video, audio, document)
 * @param {string} caption - Optional caption
 * @returns {string} Preview text
 */
const getMediaPreviewText = (fileCategory, caption) => {
  const icons = {
    image: "📷",
    video: "🎥",
    audio: "🎵",
    document: "📄",
  };

  const labels = {
    image: "Photo",
    video: "Video",
    audio: "Audio",
    document: "Document",
  };

  const icon = icons[fileCategory] || "📎";
  const label = labels[fileCategory] || "File";

  if (caption && caption.trim()) {
    return `${icon} ${caption.substring(0, 80)}`;
  }

  return `${icon} ${label}`;
};

/**
 * Get messages from a conversation
 * @param {string} conversationId - Conversation ID
 * @param {number} limitCount - Limit number of messages
 * @returns {Promise<Array>} Array of message objects
 */
export const getConversationMessages = async (
  conversationId,
  limitCount = 50
) => {
  try {
    const q = query(
      collection(db, `conversations/${conversationId}/messages`),
      orderBy("createdAt", "asc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`✅ Fetched ${messages.length} messages`);
    return messages;
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    throw error;
  }
};

/**
 * Set up real-time listener for conversation messages
 * @param {string} conversationId - Conversation ID
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export const listenToConversationMessages = (conversationId, callback) => {
  try {
    // Validate conversation ID
    if (!conversationId || typeof conversationId !== "string") {
      throw new Error("Valid conversation ID is required");
    }

    const q = query(
      collection(db, `conversations/${conversationId}/messages`),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(messages);
      },
      (error) => {
        console.error("❌ Firestore messages listener error:", error);
        // Call callback with empty array on error to avoid breaking the UI
        callback([]);
      }
    );

    console.log("✅ Real-time listener set up for messages");
    return unsubscribe;
  } catch (error) {
    console.error("❌ Error setting up message listener:", error);
    throw error;
  }
};

/**
 * Mark message as read
 * @param {string} conversationId - Conversation ID
 * @param {string} messageId - Message ID
 * @returns {Promise<void>}
 */
export const markMessageAsRead = async (conversationId, messageId) => {
  try {
    const messageRef = doc(
      db,
      `conversations/${conversationId}/messages/${messageId}`
    );
    await updateDoc(messageRef, {
      isRead: true,
      readAt: Timestamp.now(),
    });

    console.log("✅ Message marked as read");
  } catch (error) {
    console.error("❌ Error marking message as read:", error);
    throw error;
  }
};

/**
 * USERS OPERATIONS
 */

/**
 * Create or update user profile in Firestore
 * @param {string|number} userId - User ID
 * @param {Object} userData - User data object (id, name, email, mobile, profile_picture)
 * @returns {Promise<void>}
 */
export const createOrUpdateUser = async (userId, userData) => {
  try {
    // Ensure user ID is a string
    const stringUserId = ensureStringId(userId, "User ID");

    // Sanitize user data
    const sanitizedData = sanitizeUserData(userData);

    const userRef = doc(db, "users", stringUserId);

    const dataToSave = {
      id: stringUserId,
      name: sanitizedData.name,
      email: sanitizedData.email,
      mobile: sanitizedData.mobile,
      profile_picture: sanitizedData.profile_picture,
      isOnline: true,
      lastSeen: Timestamp.now(),
      createdAt: userData?.createdAt || Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(userRef, dataToSave, { merge: true });
    console.log("✅ User profile updated/created:", stringUserId);
  } catch (error) {
    console.error("❌ Error creating/updating user:", error);
    throw error;
  }
};

/**
 * Get user profile from Firestore
 * @param {string|number} userId - User ID
 * @returns {Promise<Object>} User data object
 */
export const getUserProfile = async (userId) => {
  try {
    // Ensure user ID is a string
    const stringUserId = ensureStringId(userId, "User ID");

    const userRef = doc(db, "users", stringUserId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      console.log("✅ User profile fetched:", stringUserId);
      return userSnap.data();
    } else {
      console.log("⚠️ User profile not found:", stringUserId);
      return null;
    }
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    throw error;
  }
};

/**
 * Update user online status
 * @param {string|number} userId - User ID
 * @param {boolean} isOnline - Online status
 * @returns {Promise<void>}
 */
export const updateUserOnlineStatus = async (userId, isOnline) => {
  try {
    // Ensure user ID is a string
    const stringUserId = ensureStringId(userId, "User ID");

    const userRef = doc(db, "users", stringUserId);
    await setDoc(
      userRef,
      {
        isOnline,
        lastSeen: Timestamp.now(),
      },
      { merge: true }
    );

    console.log(`✅ User online status updated: ${isOnline}`);
  } catch (error) {
    console.error("❌ Error updating user online status:", error);
    throw error;
  }
};

export default {
  createOrGetConversation,
  getUserConversations,
  listenToUserConversations,
  sendMessage,
  sendMediaMessage,
  getConversationMessages,
  listenToConversationMessages,
  markMessageAsRead,
  createOrUpdateUser,
  getUserProfile,
  updateUserOnlineStatus,
};
