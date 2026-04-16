import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Conversations list
  conversations: [],
  conversationsLoading: false,
  conversationsError: null,

  // Current chat
  currentConversationId: null,
  currentConversation: null,
  messages: [],
  messagesLoading: false,
  messagesError: null,

  // UI state
  unreadCounts: {}, // { conversationId: count }
  isTyping: false,
  typingUser: null,

  // Firebase listeners
  unsubscribeConversations: null,
  unsubscribeMessages: null,
};

const ChatSlice = createSlice({
  name: "Chat",
  initialState,
  reducers: {
    // Conversations
    setConversations(state, action) {
      state.conversations = action.payload;
    },

    setConversationsLoading(state, action) {
      state.conversationsLoading = action.payload;
    },

    setConversationsError(state, action) {
      state.conversationsError = action.payload;
    },

    addConversation(state, action) {
      const exists = state.conversations.some(
        (c) => c.id === action.payload.id
      );
      if (!exists) {
        state.conversations.unshift(action.payload);
      }
    },

    updateConversation(state, action) {
      const index = state.conversations.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.conversations[index] = action.payload;
        // Move to top
        const conversation = state.conversations.splice(index, 1)[0];
        state.conversations.unshift(conversation);
      }
    },

    // Messages
    setCurrentConversationId(state, action) {
      state.currentConversationId = action.payload;
    },

    setCurrentConversation(state, action) {
      state.currentConversation = action.payload;
    },

    setMessages(state, action) {
      state.messages = action.payload;
    },

    addMessage(state, action) {
      state.messages.push(action.payload);
    },

    setMessagesLoading(state, action) {
      state.messagesLoading = action.payload;
    },

    setMessagesError(state, action) {
      state.messagesError = action.payload;
    },

    // Unread counts
    setUnreadCounts(state, action) {
      state.unreadCounts = action.payload;
    },

    updateUnreadCount(state, action) {
      const { conversationId, count } = action.payload;
      state.unreadCounts[conversationId] = count;
    },

    // Typing indicators
    setIsTyping(state, action) {
      state.isTyping = action.payload;
    },

    setTypingUser(state, action) {
      state.typingUser = action.payload;
    },

    // Listeners (for cleanup)
    setUnsubscribeConversations(state, action) {
      state.unsubscribeConversations = action.payload;
    },

    setUnsubscribeMessages(state, action) {
      state.unsubscribeMessages = action.payload;
    },

    // Clear chat state
    clearChatState(state) {
      return initialState;
    },
  },
});

export const {
  setConversations,
  setConversationsLoading,
  setConversationsError,
  addConversation,
  updateConversation,
  setCurrentConversationId,
  setCurrentConversation,
  setMessages,
  addMessage,
  setMessagesLoading,
  setMessagesError,
  setUnreadCounts,
  updateUnreadCount,
  setIsTyping,
  setTypingUser,
  setUnsubscribeConversations,
  setUnsubscribeMessages,
  clearChatState,
} = ChatSlice.actions;

export default ChatSlice.reducer;
