import { Ratchet } from '@thant-dev/ciphersuite'
const STORAGE_KEY = 'ratchet_states'

export const state = () => ({
  ratchets: {}, // chatId -> RatchetState (not the instance)
  keyPairs: {}, // chatId -> KeyPair
  ratchetInstances: {}, // chatId -> Ratchet instance (outside of Vuex state tracking)
  initialized: [] // Array of initialized chat IDs
})

export const mutations = {
  SET_RATCHET_STATE(state, { chatId, ratchetState }) {
    state.ratchets = {
      ...state.ratchets,
      [chatId]: ratchetState
    }
  },
  SET_KEYPAIR(state, { chatId, keyPair }) {
    state.keyPairs = {
      ...state.keyPairs,
      [chatId]: keyPair
    }
  },
  SET_INITIALIZED(state, chatId) {
    if (!state.initialized.includes(chatId)) {
      state.initialized.push(chatId)
    }
  },
  REMOVE_SESSION(state, chatId) {
    const { [chatId]: removedRatchet, ...remainingRatchets } = state.ratchets
    const { [chatId]: removedKeyPair, ...remainingKeyPairs } = state.keyPairs
    state.ratchets = remainingRatchets
    state.keyPairs = remainingKeyPairs
    state.initialized = state.initialized.filter(id => id !== chatId)
    if (state.ratchetInstances[chatId]) {
      delete state.ratchetInstances[chatId]
    }
  },
  LOAD_PERSISTED_STATES(state, { persistedStates, keyPairs }) {
    state.ratchets = { ...persistedStates }
    state.keyPairs = { ...keyPairs }
    Object.keys(persistedStates).forEach(chatId => {
      if (!state.initialized.includes(chatId)) {
        state.initialized.push(chatId)
      }
    })
  }
}

export const actions = {
  loadPersistedStates({ commit }) {
    try {
      const persistedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      const { states: persistedStates = {}, keyPairs = {} } = persistedData
      commit('LOAD_PERSISTED_STATES', { persistedStates, keyPairs })
      return { persistedStates, keyPairs }
    } catch (error) {
      console.error('Failed to load persisted ratchet states:', error)
      return { persistedStates: {}, keyPairs: {} }
    }
  },

  saveRatchetState({ state }, { chatId }) {
    try {
      const ratchetInstance = state.ratchetInstances[chatId]
      if (!ratchetInstance) {
        throw new Error(`No ratchet instance found for chat ${chatId}`)
      }

      const persistedData = {
        states: {
          ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}').states,
          [chatId]: ratchetInstance.getState()
        },
        keyPairs: {
          ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}').keyPairs,
          [chatId]: state.keyPairs[chatId]
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedData))
      console.log('Saved ratchet state:',  chatId, persistedData)
    } catch (error) {
      console.error('Failed to save ratchet state:', error)
    }
  },

  async createOrRestoreRatchet({ commit, dispatch, state }, { chatId, keyPair, isInitiator, existingState = null }) {
    try {
      console.log('Creating or restoring ratchet for chat:', chatId, keyPair, isInitiator, existingState)
      // Create a new Ratchet instance
      const ratchet = new Ratchet({
        keyPair,
        isInitiator,
        verboseLog: process.env.NODE_ENV === 'development'
      })
      if (existingState) {
        console.log('Restoring ratchet for chat:', chatId, keyPair, isInitiator, existingState)
        ratchet.restoreState(existingState)
      }

      // Store the ratchet instance outside of Vuex state tracking
      state.ratchetInstances[chatId] = ratchet

      // Store the initial state and keypair in Vuex
      commit('SET_RATCHET_STATE', { chatId, ratchetState: ratchet.getState() })
      commit('SET_KEYPAIR', { chatId, keyPair })

      if (!existingState) {
        await dispatch('saveRatchetState', { chatId })
      }

      return ratchet
    } catch (error) {
      console.error('Failed to create ratchet:', error)
      throw error
    }
  },

  async initializeRatchet({ commit, dispatch, state }, { chatId, remotePublicKey }) {
    try {
      const ratchet = state.ratchetInstances[chatId]
      if (!ratchet) {
        throw new Error(`No ratchet found for chat ${chatId}`)
      }
      if (ratchet.remotePublicKey && ratchet.remotePublicKey.length === 65) {
        console.log('Ratchet already initialized for chat:', chatId)
        return
      }

      console.log('Initializing ratchet for chat:', chatId, remotePublicKey)
      await ratchet.initialize(remotePublicKey)
      commit('SET_INITIALIZED', chatId)
      commit('SET_RATCHET_STATE', { chatId, ratchetState: ratchet.getState() })

      await dispatch('saveRatchetState', { chatId })
    } catch (error) {
      console.error('Failed to initialize ratchet:', error)
      throw error
    }
  },

  async encryptMessage({ state, dispatch }, { chatId, plaintext }) {
    try {
      const ratchet = state.ratchetInstances[chatId]
      if (!ratchet) {
        throw new Error(`No ratchet found for chat ${chatId}`)
      }

      const encryptedMessage = await ratchet.encrypt(plaintext)
      await dispatch('saveRatchetState', { chatId })

      return encryptedMessage
    } catch (error) {
      console.error('Failed to encrypt message:', error)
      throw error
    }
  },

  async decryptMessage({ state, dispatch }, { chatId, encryptedMessage }) {
    try {
      const ratchet = state.ratchetInstances[chatId]
      if (!ratchet) {
        throw new Error(`No ratchet found for chat ${chatId}`)
      }

      const decryptedMessage = await ratchet.decrypt(encryptedMessage)
      console.log('Decrypted message:', decryptedMessage)
      await dispatch('saveRatchetState', { chatId })

      return decryptedMessage
    } catch (error) {
      console.error('Failed to decrypt message:', error)
      throw error
    }
  }
}

export const getters = {
  getRatchet: state => chatId => state.ratchetInstances[chatId],
  getPublicKey: state => chatId => {
    const keyPair = state.keyPairs[chatId]
    if (!keyPair) {
      throw new Error(`No keypair found for chat ${chatId}`)
    }
    return keyPair.publicKey
  },
  isInitialized: state => chatId => state.initialized.includes(chatId),
  getRatchetState: state => chatId => {
    const ratchet = state.ratchetInstances[chatId]
    if (!ratchet) {
      throw new Error(`No ratchet found for chat ${chatId}`)
    }
    return ratchet.getState()
  }
}
