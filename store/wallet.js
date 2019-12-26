export const state = () => ({
  wallet: null
})

export const getters = {
  getWallet: state => state.wallet
}

export const mutations = {
  addWallet (state, payload) {
    state.wallet = payload
  },
  removeWallet (state) {
    state.wallet = null
  }
}

export const actions = {
  async addWallet (store, payload) {
    store.commit('addWallet', payload)
  },
  async removeWallet (store) {
    store.commit('removeWallet')
  }
}
