export const state = () => ({
    appState: null,
    network: null,
    lastMessage: null,
    lastTx: null,
    isUIReady: false
})

export const getters = {
    getAppState: state => state.appState,
    getNetwork: state => state.network,
    getLastMessage: state => state.lastMessage,
    getLastTx: state => state.lastTx,
    isUIReady: state => state.isUIReady
}

export const mutations = {
    updateAppState(state, payload) {
        state.appState = payload
    },
    updateNetwork(state, payload) {
        state.network = payload
        state.network.timestamp = Date.now()
    },
    setUIReady(state) {
        state.isUIReady = true
    },
    updateLastMessage(state, payload) {
        state.lastMessage = payload
    },
    updateLastTx(state, payload) {
        state.lastTx = payload
    }
}

export const actions = {
    async updateAppState(store, payload) {
        store.commit('updateAppState', payload)
    },
    async updateNetwork(store, payload) {
        store.commit('updateNetwork', payload)
    },
    async setUIReady(store) {
        store.commit('setUIReady')
    },
    async updateLastMessage(store, payload) {
        store.commit('updateLastMessage', payload)
    },
    async updateLastTx(store, payload) {
        store.commit('updateLastTx', payload)
    }
}