// store/chat.js
import utils from "../assets/utils";
import { secpUtils } from "@thant-dev/ciphersuite";

export const state = () => ({
  chats: {}, // otherPersonAddress -> { messages: [], chatId: string }
  polling: {
    enabled: false,
    interval: null,
    lastPolledAt: null
  },
  totalMessages: 0,
  loading: false,
  error: null,
  retryCount: 0,
  maxRetries: 3,
  pendingMessages: {}
});

export const mutations = {
  SET_CHATS(state, chats) {
    state.chats = chats;
  },
  SET_POLLING(state, { enabled, interval }) {
    state.polling.enabled = enabled;
    state.polling.interval = interval;
  },
  SET_LAST_POLLED(state, timestamp) {
    state.polling.lastPolledAt = timestamp;
  },
  SET_TOTAL_MESSAGES(state, count) {
    state.totalMessages = count;
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  INCREMENT_RETRY(state) {
    state.retryCount++;
  },
  RESET_RETRY(state) {
    state.retryCount = 0;
  },
  ADD_PENDING_MESSAGE(state, { message, chatId }) {
    state.pendingMessages = {
      ...state.pendingMessages,
      [chatId]: state.pendingMessages[chatId]
        ? [...state.pendingMessages[chatId], message]
        : [message]
    };
  },
  REMOVE_PENDING_MESSAGE(state, { index, chatId }) {
    // Early returns for invalid cases
    if (
      !state.pendingMessages[chatId] ||
      index < 0 ||
      index >= state.pendingMessages[chatId].length
    ) {
      return;
    }

    // Create new array without the removed message
    const updatedMessages = [
      ...state.pendingMessages[chatId].slice(0, index),
      ...state.pendingMessages[chatId].slice(index + 1)
    ];

    // Create new object reference for reactivity
    state.pendingMessages = {
      ...state.pendingMessages,
      [chatId]: updatedMessages
    };
  }
};

export const actions = {
  async startPolling({ dispatch, commit, rootGetters }) {
    // Clear any existing polling
    dispatch("stopPolling");

    const pollInterval = setInterval(async () => {
      await dispatch("pollMessages");
    }, 5000); // Poll every 10 seconds

    commit("SET_POLLING", { enabled: true, interval: pollInterval });
  },

  stopPolling({ state, commit }) {
    if (state.polling.interval) {
      clearInterval(state.polling.interval);
      commit("SET_POLLING", { enabled: false, interval: null });
    }
  },

  async initializeChat(
    { dispatch, rootGetters },
    { otherPersonAddress, chatId }
  ) {
    try {
      const wallet = rootGetters["wallet/getWallet"];
      const otherPersonPk = await utils.getAccountPublicKey(otherPersonAddress);
      await dispatch(
        "ratchet/makeSureRatchetExists",
        {
          walletAddress: wallet.entry.address,
          chatId,
          otherPersonAddress,
          otherPersonPk
        },
        { root: true }
      );
    } catch (error) {
      console.error("Failed to initialize chat:", error);
      throw error;
    }
  },

  async pollMessages({ commit, state, rootGetters, dispatch }) {
    if (state.loading) return;

    try {
      commit("SET_LOADING", true);

      const wallet = rootGetters["wallet/getWallet"];
      const appState = rootGetters["app/getAppState"];
      if (!appState) {
        console.warn("PollMessages: No app state available");
        return;
      }
      if (!wallet?.entry?.address) {
        console.warn("PollMessages: No wallet address available");
        return;
      }

      let allChats = {};
      let totalMessages = 0;
      let hasNewMessages = false;

      const chatHistory = [];
      for (let [key, value] of Object.entries(appState.data.chats)) {
        chatHistory.push({
          otherPersonAddress: key,
          chatId: value
        });
      }

      // Query all chats and calculate total messages
      for (let history of chatHistory) {
        const [otherPersonAddress, chatId] = [
          history.otherPersonAddress,
          history.chatId
        ];

        const chatList = await utils.queryEncryptedChats(history.chatId);
        totalMessages += chatList.length;
        allChats[chatId] = chatList;
      }

      // Check if we have new messages
      if (totalMessages > state.totalMessages) {
        hasNewMessages = true;
        commit("SET_TOTAL_MESSAGES", totalMessages);
      }
      console.log("Total messages:", totalMessages);
      console.log("Has new messages:", hasNewMessages);

      // Process new messages if any
      if (hasNewMessages) {
        const processedChats = {};

        for (let history of chatHistory) {
          const { otherPersonAddress, chatId } = history;
          const encryptedChatList = allChats[chatId];
          if (!encryptedChatList?.length) continue;
          const otherPersonPk = await utils.getAccountPublicKey(
            otherPersonAddress
          );

          await dispatch(
            "ratchet/makeSureRatchetExists",
            {
              chatId,
              walletAddress: wallet.entry.address,
              otherPersonAddress,
              otherPersonPk
            },
            { root: true }
          );

          // Decrypt messages
          const decryptedMessages = [];
          for (let sealed of encryptedChatList) {
            try {
              const decryptedStr = await dispatch(
                "ratchet/decryptMessage",
                {
                  walletAddress: wallet.entry.address,
                  chatId,
                  encryptedMessage: sealed.message
                },
                { root: true }
              );

              const parsedMessageStr = JSON.parse(decryptedStr);
              decryptedMessages.push(parsedMessageStr);

              if (state.pendingMessages[chatId]) {
                for (let i = 0; i < state.pendingMessages[chatId].length; i++) {
                  const pendingMessage = state.pendingMessages[chatId][i];
                  if (
                    pendingMessage?.timestamp === parsedMessageStr.timestamp
                  ) {
                    commit("REMOVE_PENDING_MESSAGE", { index: i, chatId });
                  }
                }
              }
            } catch (error) {
              console.error("Failed to decrypt message:", error);
              decryptedMessages.push(null);
            }
          }

          // Save ratchet state after decryption
          await dispatch(
            "ratchet/saveRatchetState",
            { chatId, walletAddress: wallet.entry.address },
            { root: true }
          );

          // Store valid messages
          processedChats[otherPersonAddress] = {
            messages: decryptedMessages.filter(msg => msg !== null),
            chatId
          };
        }

        commit("SET_CHATS", processedChats);
      }

      commit("RESET_RETRY");
      commit("SET_LAST_POLLED", Date.now());
    } catch (error) {
      console.error("Error polling messages:", error);
      commit("SET_ERROR", error.message);
      commit("INCREMENT_RETRY");

      // Stop polling if max retries reached
      if (state.retryCount >= state.maxRetries) {
        dispatch("stopPolling");
      }
    } finally {
      commit("SET_LOADING", false);
    }
  },
  setPendingMessage({ commit }, { message, chatId }) {
    commit("ADD_PENDING_MESSAGE", { message, chatId });
  }
};

export const getters = {
  getChats: state => state.chats,
  getChatMessages: state => otherPersonAddress =>
    state.chats[otherPersonAddress]?.messages || [],
  getChatId: state => otherPersonAddress =>
    state.chats[otherPersonAddress]?.chatId,
  isPolling: state => state.polling.enabled,
  getLoading: state => state.loading,
  getError: state => state.error,
  getTotalMessages: state => state.totalMessages,
  getPendingMessages: state => chatId => {
    return state.pendingMessages[chatId] || [];
  }
};
