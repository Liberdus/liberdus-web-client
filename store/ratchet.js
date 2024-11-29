import { Ratchet, secpUtils } from "@thant-dev/ciphersuite";
import utils from "../assets/utils";

export const state = () => ({
  ratchets: {}, // walletAddress -> { chatId -> RatchetState }
  keyPairs: {}, // walletAddress -> { chatId -> KeyPair }
  ratchetInstances: {}, // walletAddress -> { chatId -> Ratchet instance }
  initialized: {}, // walletAddress -> string[] of initialized chat IDs
  currentWallet: null // Current active wallet address
});

export const mutations = {
  SET_CURRENT_WALLET(state, walletAddress) {
    state.currentWallet = walletAddress;
    // Initialize wallet structures if they don't exist
    if (!state.ratchets[walletAddress]) state.ratchets[walletAddress] = {};
    if (!state.keyPairs[walletAddress]) state.keyPairs[walletAddress] = {};
    if (!state.ratchetInstances[walletAddress])
      state.ratchetInstances[walletAddress] = {};
    if (!state.initialized[walletAddress])
      state.initialized[walletAddress] = [];
  },

  SET_RATCHET_STATE(state, { walletAddress, chatId, ratchetState }) {
    state.ratchets = {
      ...state.ratchets,
      [walletAddress]: {
        ...state.ratchets[walletAddress],
        [chatId]: ratchetState
      }
    };
  },

  SET_KEYPAIR(state, { walletAddress, chatId, keyPair }) {
    state.keyPairs = {
      ...state.keyPairs,
      [walletAddress]: {
        ...state.keyPairs[walletAddress],
        [chatId]: keyPair
      }
    };
  },

  SET_INITIALIZED(state, { walletAddress, chatId }) {
    if (!state.initialized[walletAddress]?.includes(chatId)) {
      state.initialized[walletAddress] = [
        ...(state.initialized[walletAddress] || []),
        chatId
      ];
    }
  },

  REMOVE_SESSION(state, { walletAddress, chatId }) {
    const { [chatId]: removedRatchet, ...remainingRatchets } =
      state.ratchets[walletAddress] || {};
    const { [chatId]: removedKeyPair, ...remainingKeyPairs } =
      state.keyPairs[walletAddress] || {};

    state.ratchets = {
      ...state.ratchets,
      [walletAddress]: remainingRatchets
    };
    state.keyPairs = {
      ...state.keyPairs,
      [walletAddress]: remainingKeyPairs
    };

    state.initialized = {
      ...state.initialized,
      [walletAddress]: (state.initialized[walletAddress] || []).filter(
        id => id !== chatId
      )
    };

    if (state.ratchetInstances[walletAddress]?.[chatId]) {
      delete state.ratchetInstances[walletAddress][chatId];
    }
  },

  LOAD_PERSISTED_STATES(state, { walletAddress, persistedStates, keyPairs }) {
    state.ratchets = {
      ...state.ratchets,
      [walletAddress]: persistedStates
    };
    state.keyPairs = {
      ...state.keyPairs,
      [walletAddress]: keyPairs
    };

    state.initialized = {
      ...state.initialized,
      [walletAddress]: Object.keys(persistedStates)
    };
  }
};

export const actions = {
  loadPersistedStates({ commit }, walletAddress) {
    try {
      const allWalletData = JSON.parse(
        localStorage.getItem("wallet_ratchet_states") || "{}"
      );
      const walletData = allWalletData[walletAddress] || {
        states: {},
        keyPairs: {}
      };

      commit("SET_CURRENT_WALLET", walletAddress);
      commit("LOAD_PERSISTED_STATES", {
        walletAddress,
        persistedStates: walletData.states,
        keyPairs: walletData.keyPairs
      });
      console.log("Loaded persisted ratchet states:");
      return walletData;
    } catch (error) {
      console.error("Failed to load persisted ratchet states:", error);
      return { states: {}, keyPairs: {} };
    }
  },

  saveRatchetState({ state }, { walletAddress, chatId }) {
    try {
      const ratchetInstance = state.ratchetInstances[walletAddress]?.[chatId];
      if (!ratchetInstance) {
        throw new Error(
          `No ratchet instance found for wallet ${walletAddress} and chat ${chatId}`
        );
      }

      const allWalletData = JSON.parse(
        localStorage.getItem("wallet_ratchet_states") || "{}"
      );

      allWalletData[walletAddress] = {
        states: {
          ...(allWalletData[walletAddress]?.states || {}),
          [chatId]: ratchetInstance.getState()
        },
        keyPairs: {
          ...(allWalletData[walletAddress]?.keyPairs || {}),
          [chatId]: state.keyPairs[walletAddress][chatId]
        }
      };

      localStorage.setItem(
        "wallet_ratchet_states",
        JSON.stringify(allWalletData)
      );
      console.log(
        "Saved ratchet state for wallet:",
        walletAddress,
        "chat:",
        chatId
      );
    } catch (error) {
      console.error("Failed to save ratchet state:", error);
    }
  },

  async makeSureRatchetExists(
    { state, dispatch, rootGetters },
    { walletAddress, chatId, otherPersonAddress, otherPersonPk }
  ) {
    // check the existing ratchet in vuex memory
    if (getters.getRatchet(state)(walletAddress, chatId)) {
      console.log(
        "makeSureRatchetExists: Ratchet already exists for chat:",
        chatId
      );
      return;
    }

    console.log("makeSureRatchetExists: no ratchet, initializing ratchet");
    const wallet = rootGetters["wallet/getWallet"];

    // Load persisted states to check if we have existing ratchet
    const storedStates = await dispatch("loadPersistedStates", walletAddress);

    if (
      storedStates == null ||
      storedStates.states == null ||
      storedStates.states[chatId] == null
    ) {
      console.log(
        "makeSureRatchetExists: no persisted state, initializing ratchet"
      );
      // Create new ratchet if no persisted state exists
      await dispatch(
        "ratchet/createOrRestoreRatchet",
        {
          walletAddress: wallet.entry.address,
          chatId,
          keyPair: wallet.entry.keys,
          isInitiator: utils.isInitiator(
            wallet.entry.address,
            otherPersonAddress
          )
        },
        { root: true }
      );

      // Initialize the ratchet with the other person's public key
      await dispatch(
        "ratchet/initializeRatchet",
        {
          walletAddress: wallet.entry.address,
          chatId,
          remotePublicKey: secpUtils.hexToBytes(otherPersonPk)
        },
        { root: true }
      );
    } else {
      console.log(
        "makeSureRatchetExists: persisted state exists, restoring ratchet"
      );
      // Restore existing ratchet state
      await dispatch(
        "ratchet/createOrRestoreRatchet",
        {
          walletAddress: wallet.entry.address,
          chatId,
          keyPair: wallet.entry.keys,
          isInitiator: utils.isInitiator(
            wallet.entry.address,
            otherPersonAddress
          ),
          existingState: storedStates.states[chatId]
        },
        { root: true }
      );
    }
  },

  async createOrRestoreRatchet(
    { commit, dispatch, state },
    { walletAddress, chatId, keyPair, isInitiator, existingState = null }
  ) {
    try {
      console.log(
        "Calling createOrRestoreRatchet",
        walletAddress,
        "chat:",
        chatId
      );
      const ratchet = new Ratchet({
        keyPair,
        isInitiator,
        verboseLog: process.env.NODE_ENV === "development"
      });

      if (existingState) {
        console.log(
          "Restoring existing state for wallet:",
          walletAddress,
          "chat:",
          chatId
        );
        ratchet.restoreState(existingState);
      }

      // Initialize wallet's ratchet instances if needed
      if (!state.ratchetInstances[walletAddress]) {
        state.ratchetInstances[walletAddress] = {};
      }

      state.ratchetInstances[walletAddress][chatId] = ratchet;

      commit("SET_RATCHET_STATE", {
        walletAddress,
        chatId,
        ratchetState: ratchet.getState()
      });
      commit("SET_KEYPAIR", { walletAddress, chatId, keyPair });

      if (!existingState) {
        await dispatch("saveRatchetState", { walletAddress, chatId });
      }

      return ratchet;
    } catch (error) {
      console.error("Failed to create ratchet:", error);
      throw error;
    }
  },

  async initializeRatchet(
    { commit, dispatch, state },
    { walletAddress, chatId, remotePublicKey }
  ) {
    try {
      const ratchet = state.ratchetInstances[walletAddress]?.[chatId];
      if (!ratchet) {
        throw new Error(
          `No ratchet found for wallet ${walletAddress} and chat ${chatId}`
        );
      }

      if (ratchet.remotePublicKey && ratchet.remotePublicKey.length === 65) {
        // check if the ratchet is already initialized with the same public key
        if (
          ratchet.remotePublicKey.every(
            (byte, index) => byte === remotePublicKey[index]
          )
        ) {
          console.log(
            "Ratchet already initialized for wallet:",
            walletAddress,
            "chat:",
            chatId
          );
          return;
        }
      }

      await ratchet.initialize(remotePublicKey);
      commit("SET_INITIALIZED", { walletAddress, chatId });
      commit("SET_RATCHET_STATE", {
        walletAddress,
        chatId,
        ratchetState: ratchet.getState()
      });

      await dispatch("saveRatchetState", { walletAddress, chatId });
    } catch (error) {
      console.error("Failed to initialize ratchet:", error);
      throw error;
    }
  },

  async encryptMessage(
    { state, dispatch },
    { walletAddress, chatId, plaintext }
  ) {
    try {
      const ratchet = state.ratchetInstances[walletAddress]?.[chatId];
      if (!ratchet) {
        throw new Error(
          `No ratchet found for wallet ${walletAddress} and chat ${chatId}`
        );
      }

      const encryptedMessage = await ratchet.encrypt(plaintext);
      await dispatch("saveRatchetState", { walletAddress, chatId });

      return encryptedMessage;
    } catch (error) {
      console.error("Failed to encrypt message:", error);
      throw error;
    }
  },

  async decryptMessage(
    { state, dispatch },
    { walletAddress, chatId, encryptedMessage }
  ) {
    try {
      const ratchet = state.ratchetInstances[walletAddress]?.[chatId];
      if (!ratchet) {
        throw new Error(
          `No ratchet found for wallet ${walletAddress} and chat ${chatId}`
        );
      }

      const decryptedMessage = await ratchet.decrypt(encryptedMessage);
      await dispatch("saveRatchetState", { walletAddress, chatId });

      return decryptedMessage;
    } catch (error) {
      console.error("Failed to decrypt message:", error);
      throw error;
    }
  }
};

export const getters = {
  getRatchet: state => (walletAddress, chatId) =>
    state.ratchetInstances[walletAddress]?.[chatId],

  getPublicKey: state => (walletAddress, chatId) => {
    const keyPair = state.keyPairs[walletAddress]?.[chatId];
    if (!keyPair) {
      throw new Error(
        `No keypair found for wallet ${walletAddress} and chat ${chatId}`
      );
    }
    return keyPair.publicKey;
  },

  isInitialized: state => (walletAddress, chatId) =>
    state.initialized[walletAddress]?.includes(chatId),

  getRatchetState: state => (walletAddress, chatId) => {
    const ratchet = state.ratchetInstances[walletAddress]?.[chatId];
    if (!ratchet) {
      throw new Error(
        `No ratchet found for wallet ${walletAddress} and chat ${chatId}`
      );
    }
    return ratchet.getState();
  },

  getCurrentWallet: state => state.currentWallet
};
