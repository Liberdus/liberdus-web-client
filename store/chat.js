export const state = () => ({
  appState: null,
  network: null,
  lastMessage: {
    message: null
  },
  lastTx: {
    txId: null
  },
  isUIReady: false,
  notificationQueue: []
})

export const getters = {
  getAppState: state => state.appState,
  getNetwork: state => state.network,
  getLastMessage: state => state.lastMessage,
  getLastTx: state => state.lastTx,
  getNotificationQueue: state => state.notificationQueue,
  isUIReady: state => state.isUIReady
}

export const mutations = {
  updateAppState (state, payload) {
    state.appState = payload
  },
  updateNetwork (state, payload) {
    state.network = payload
    state.network.timestamp = Date.now()
  },
  setUIReady (state) {
    state.isUIReady = true
  },
  updateLastMessage (state, payload) {
    state.lastMessage = payload
    localStorage.setItem('lastMessage', JSON.stringify(state.lastMessage))
  },
  updateLastTx (state, payload) {
    state.lastTx = payload
    localStorage.setItem('lastTx', JSON.stringify(state.lastTx))
  },
  addNotificationQueue (state, payload) {
    state.notificationQueue.push(payload)
  },
  clearNotificationQueue (state) {
    state.notificationQueue = []
  }
}

export const actions = {
  async updateAppState (store, payload) {
    store.commit('updateAppState', payload)
  },
  async updateNetwork (store, payload) {
    store.commit('updateNetwork', payload)
  },
  async setUIReady (store) {
    store.commit('setUIReady')
  },
  async updateLastMessage (store, payload) {
    store.commit('updateLastMessage', payload)
  },
  async updateLastTx (store, payload) {
    store.commit('updateLastTx', payload)
  },
  async addNotificationQueue (store, payload) {
    store.commit('addNotificationQueue', payload)
  },
  async clearNotificationQueue (store) {
    store.commit('clearNotificationQueue')
  }
}
