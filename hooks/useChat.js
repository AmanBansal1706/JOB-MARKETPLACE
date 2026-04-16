import { useEffect, useCallback, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setConversations,
  setMessages,
  addMessage,
  updateConversation,
  setConversationsLoading,
  setMessagesLoading,
  setConversationsError,
  setMessagesError,
  setCurrentConversationId,
} from "../store/Chat";
import {
  createOrGetConversation,
  listenToUserConversations,
  listenToConversationMessages,
  sendMessage as sendMessageService,
  sendMediaMessage as sendMediaMessageService,
  createOrUpdateUser,
  getUserProfile,
} from "../services/ChatServices";
import { setFirebaseInitialized, setFirebaseError } from "../store/Auth";
import { convertFirestoreTimestamps } from "../utils/firebaseConverter";

/**
 * Helper function to validate user object has required fields
 * @param {Object} user - User object to validate
 * @returns {boolean} True if user is valid
 */
const isValidUser = (user) => {
  return user && user.id !== null && user.id !== undefined;
};

/**
 * Hook to initialize user profile on Firestore
 */
export const useInitializeFirebaseUser = () => {
  const user = useSelector((state) => state.Auth.user);
  const dispatch = useDispatch();
  const initializingRef = useRef(false);

  useEffect(() => {
    // Validate user object
    if (!isValidUser(user)) {
      console.log("⚠️ No valid user for Firebase initialization");
      return;
    }

    // Prevent multiple simultaneous initialization attempts
    if (initializingRef.current) {
      return;
    }

    const initializeUser = async () => {
      initializingRef.current = true;

      try {
        await createOrUpdateUser(user.id, {
          name: user.name || "",
          email: user.email || "",
          mobile: user.mobile || null,
          profile_picture: user.profile_picture || null,
        });

        dispatch(setFirebaseInitialized(true));
        dispatch(setFirebaseError(null));
        console.log("✅ User initialized on Firebase");
      } catch (error) {
        console.error("❌ Error initializing Firebase user:", error);
        dispatch(
          setFirebaseError(error.message || "Firebase initialization failed")
        );
        dispatch(setFirebaseInitialized(false));
      } finally {
        initializingRef.current = false;
      }
    };

    initializeUser();
  }, [user?.id, dispatch]);
};

/**
 * Hook to listen to user conversations in real-time
 */
export const useConversations = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.user);
  const conversations = useSelector((state) => state.Chat.conversations);
  const loading = useSelector((state) => state.Chat.conversationsLoading);
  const error = useSelector((state) => state.Chat.conversationsError);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    // Validate user
    if (!isValidUser(user)) {
      dispatch(setConversationsLoading(false));
      return;
    }

    dispatch(setConversationsLoading(true));
    dispatch(setConversationsError(null));

    try {
      // Clean up previous listener if exists
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      unsubscribeRef.current = listenToUserConversations(
        user.id,
        (conversations) => {
          // Convert Firestore Timestamps to milliseconds for Redux
          const converted = convertFirestoreTimestamps(conversations);
          dispatch(setConversations(converted));
          dispatch(setConversationsLoading(false));
          dispatch(setConversationsError(null));
        }
      );

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      };
    } catch (err) {
      console.error("Error setting up conversations listener:", err);
      dispatch(
        setConversationsError(err.message || "Failed to load conversations")
      );
      dispatch(setConversationsLoading(false));
    }
  }, [user?.id, dispatch]);

  return { conversations, loading, error };
};

/**
 * Hook to listen to messages in a conversation
 */
export const useMessages = (conversationId) => {
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.Chat.messages);
  const loading = useSelector((state) => state.Chat.messagesLoading);
  const error = useSelector((state) => state.Chat.messagesError);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    // Validate conversation ID
    if (!conversationId || typeof conversationId !== "string") {
      dispatch(setMessagesLoading(false));
      return;
    }

    dispatch(setMessagesLoading(true));
    dispatch(setMessagesError(null));
    dispatch(setCurrentConversationId(conversationId));

    try {
      // Clean up previous listener if exists
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      unsubscribeRef.current = listenToConversationMessages(
        conversationId,
        (messages) => {
          // Convert Firestore Timestamps to milliseconds for Redux
          const converted = convertFirestoreTimestamps(messages);
          dispatch(setMessages(converted));
          dispatch(setMessagesLoading(false));
          dispatch(setMessagesError(null));
        }
      );

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      };
    } catch (err) {
      console.error("Error setting up messages listener:", err);
      dispatch(setMessagesError(err.message || "Failed to load messages"));
      dispatch(setMessagesLoading(false));
    }
  }, [conversationId, dispatch]);

  return { messages, loading, error };
};

/**
 * Hook to send a message
 */
export const useSendMessage = (conversationId) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.user);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(
    async (messageText) => {
      // Validate inputs
      if (!isValidUser(user)) {
        setError("User not authenticated");
        return null;
      }

      if (!conversationId || typeof conversationId !== "string") {
        setError("Invalid conversation");
        return null;
      }

      if (!messageText || !messageText.trim()) {
        setError("Message cannot be empty");
        return null;
      }

      setIsSending(true);
      setError(null);

      try {
        const messageId = await sendMessageService(
          conversationId,
          user.id,
          user.name || "User",
          messageText.trim(),
          "text"
        );

        console.log("✅ Message sent:", messageId);
        return messageId;
      } catch (err) {
        console.error("❌ Error sending message:", err);
        setError(err.message || "Failed to send message");
        return null;
      } finally {
        setIsSending(false);
      }
    },
    [user?.id, user?.name, conversationId]
  );

  return { sendMessage, isSending, error };
};

/**
 * Hook to start or get conversation
 */
export const useOrCreateConversation = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.Auth.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startConversation = useCallback(
    async (otherUserId, otherUserData) => {
      // Validate current user
      if (!isValidUser(currentUser)) {
        setError("User not authenticated");
        return null;
      }

      // Validate other user ID
      if (otherUserId === null || otherUserId === undefined) {
        setError("Other user ID is required");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const conversationId = await createOrGetConversation(
          currentUser.id,
          {
            name: currentUser.name || "",
            email: currentUser.email || "",
            mobile: currentUser.mobile || null,
            profile_picture: currentUser.profile_picture || null,
          },
          otherUserId,
          {
            name: otherUserData?.name || "",
            email: otherUserData?.email || "",
            mobile: otherUserData?.mobile || null,
            profile_picture: otherUserData?.profile_picture || null,
          }
        );

        console.log("✅ Conversation created/retrieved:", conversationId);
        return conversationId;
      } catch (err) {
        console.error("❌ Error creating conversation:", err);
        setError(err.message || "Failed to create conversation");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      currentUser?.id,
      currentUser?.name,
      currentUser?.email,
      currentUser?.mobile,
      currentUser?.profile_picture,
    ]
  );

  return { startConversation, loading, error };
};

/**
 * Hook to send a media message with file upload
 */
export const useSendMediaMessage = (conversationId) => {
  const user = useSelector((state) => state.Auth.user);
  const [isSending, setIsSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const sendMediaMessage = useCallback(
    async (file, caption = "") => {
      // Validate inputs
      if (!isValidUser(user)) {
        setError("User not authenticated");
        return null;
      }

      if (!conversationId || typeof conversationId !== "string") {
        setError("Invalid conversation");
        return null;
      }

      if (!file || !file.uri) {
        setError("No file selected");
        return null;
      }

      setIsSending(true);
      setUploadProgress(0);
      setError(null);

      try {
        const messageId = await sendMediaMessageService(
          conversationId,
          user.id,
          user.name || "User",
          file,
          caption,
          (progress) => {
            setUploadProgress(progress);
          }
        );

        console.log("✅ Media message sent:", messageId);
        setUploadProgress(100);
        return messageId;
      } catch (err) {
        console.error("❌ Error sending media message:", err);
        setError(err.message || "Failed to send media");
        return null;
      } finally {
        setIsSending(false);
        // Reset progress after a short delay
        setTimeout(() => setUploadProgress(0), 500);
      }
    },
    [user?.id, user?.name, conversationId]
  );

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendMediaMessage,
    isSending,
    uploadProgress,
    error,
    resetError,
  };
};

export default {
  useInitializeFirebaseUser,
  useConversations,
  useMessages,
  useSendMessage,
  useSendMediaMessage,
  useOrCreateConversation,
};
