import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} from "@env";

// Firebase configuration object
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app;
let db;
let storage;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log("✅ Firebase initialized successfully (Firestore + Storage)");
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
}

/**
 * File type configurations for validation
 */
const FILE_CONFIG = {
  image: {
    maxSize: 10 * 1024 * 1024, // 10 MB
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    folder: "images",
  },
  video: {
    maxSize: 50 * 1024 * 1024, // 50 MB
    allowedTypes: ["video/mp4", "video/quicktime", "video/x-m4v"],
    folder: "videos",
  },
  audio: {
    maxSize: 10 * 1024 * 1024, // 10 MB
    allowedTypes: [
      "audio/mpeg",
      "audio/mp4",
      "audio/wav",
      "audio/x-m4a",
      "audio/aac",
    ],
    folder: "audio",
  },
  document: {
    maxSize: 20 * 1024 * 1024, // 20 MB
    allowedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    folder: "documents",
  },
};

/**
 * Determine file category from MIME type
 * @param {string} mimeType - MIME type of the file
 * @returns {string} File category (image, video, audio, document)
 */
export const getFileCategory = (mimeType) => {
  if (!mimeType) return "document";

  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "document";
};

/**
 * Validate file before upload
 * @param {Object} file - File object with uri, mimeType, fileSize
 * @param {string} category - File category (image, video, audio, document)
 * @returns {{ valid: boolean, error: string | null }}
 */
export const validateFile = (file, category) => {
  const config = FILE_CONFIG[category];

  if (!config) {
    return { valid: false, error: "Unknown file type" };
  }

  // Check file size
  if (file.fileSize && file.fileSize > config.maxSize) {
    const maxSizeMB = config.maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check MIME type (if provided)
  if (file.mimeType && !config.allowedTypes.includes(file.mimeType)) {
    return {
      valid: false,
      error: `File type ${file.mimeType} is not allowed`,
    };
  }

  return { valid: true, error: null };
};

/**
 * Upload a file to Firebase Storage for chat
 * @param {string} conversationId - Conversation ID
 * @param {string} messageId - Message ID (for unique filename)
 * @param {Object} file - File object { uri, mimeType, fileName, fileSize }
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<{ url: string, path: string }>}
 */
export const uploadChatFile = async (
  conversationId,
  messageId,
  file,
  onProgress = () => {}
) => {
  try {
    if (!storage) {
      throw new Error("Firebase Storage not initialized");
    }

    const category = getFileCategory(file.mimeType);
    const config = FILE_CONFIG[category];

    // Validate file
    const validation = validateFile(file, category);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Create file path
    const fileExtension = file.fileName?.split(".").pop() || "file";
    const storagePath = `chat-files/${conversationId}/${config.folder}/${messageId}.${fileExtension}`;

    // Create storage reference
    const storageRef = ref(storage, storagePath);

    // Fetch the file as blob
    const response = await fetch(file.uri);
    const blob = await response.blob();

    // Upload with progress tracking
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, blob, {
        contentType: file.mimeType || "application/octet-stream",
        customMetadata: {
          originalFileName: file.fileName || "unknown",
          conversationId: conversationId,
          messageId: messageId,
        },
      });

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(Math.round(progress));
          console.log(`📤 Upload progress: ${Math.round(progress)}%`);
        },
        (error) => {
          console.error("❌ Upload error:", error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("✅ File uploaded successfully:", downloadURL);
            resolve({
              url: downloadURL,
              path: storagePath,
            });
          } catch (urlError) {
            reject(urlError);
          }
        }
      );
    });
  } catch (error) {
    console.error("❌ Error uploading file:", error);
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage
 * @param {string} filePath - Full storage path of the file
 * @returns {Promise<void>}
 */
export const deleteChatFile = async (filePath) => {
  try {
    if (!storage) {
      throw new Error("Firebase Storage not initialized");
    }

    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    console.log("✅ File deleted successfully:", filePath);
  } catch (error) {
    console.error("❌ Error deleting file:", error);
    throw error;
  }
};

/**
 * Get file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Human readable size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export { app, db, storage, FILE_CONFIG };
