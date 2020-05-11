export const state = () => ({
  appState: null,
  network: null,
  lastMessage: null,
  lastTx: null,
  isUIReady: false,
  notificationQueue: [],
  timers: {},
  windowFocus: true
})

export const getters = {
  getAppState: state => state.appState,
  getNetwork: state => state.network,
  getTimers: state => state.timers,
  getLastMessage: state => state.lastMessage,
  getLastTx: state => state.lastTx,
  getNotificationQueue: state => state.notificationQueue,
  isUIReady: state => state.isUIReady,
  getWindowFocus: state => state.windowFocus
}

export const mutations = {
  updateAppState (state, payload) {
    state.appState = payload
  },
  addTimer (state, payload) {
    state.timers[payload.key] = payload.value
  },
  updateNetwork (state, payload) {
    state.network = payload
  },
  setUIReady (state) {
    state.isUIReady = true
  },
  updateWindowFocus (state, payload) {
    state.windowFocus = payload
  },
  updateLastMessage (state, payload) {
    state.lastMessage = payload

    const existingLastMessages = JSON.parse(localStorage.getItem('lastMessage'))
    if (existingLastMessages) {
      existingLastMessages[payload.walletUsername] = payload
      localStorage.setItem('lastMessage', JSON.stringify(existingLastMessages))
    } else {
      const obj = {}
      obj[payload.walletUsername] = payload
      localStorage.setItem('lastMessage', JSON.stringify(obj))
    }
  },
  updateLastTx (state, payload) {
    state.lastTx = payload
    const existingLastTx = JSON.parse(localStorage.getItem('lastTx'))
    if (existingLastTx) {
      existingLastTx[payload.walletUsername] = payload
      localStorage.setItem('lastTx', JSON.stringify(existingLastTx))
    } else {
      const obj = {}
      obj[payload.walletUsername] = payload
      localStorage.setItem('lastTx', JSON.stringify(obj))
    }
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
  async addTimer (store, payload) {
    store.commit('addTimer', payload)
  },
  async updateNetwork (store, payload) {
    store.commit('updateNetwork', payload)
  },
  async setUIReady (store) {
    store.commit('setUIReady')
  },
  async updateWindowFocus (store, payload) {
    store.commit('updateWindowFocus', payload)
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
