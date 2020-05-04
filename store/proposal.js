export const state = () => ({
  activeProposals: [],
  completedProposals: [],
  activeDevProposals: [],
  completedDevProposals: [],
  fundingWindowType: null,
  economyWindowType: null
})

export const getters = {
  getActiveProposals: state => state.activeProposals,
  getCompletedProposals: state => state.completedProposals,
  getActiveDevProposals: state => state.activeDevProposals,
  getCompletedDevProposals: state => state.completedDevProposals,
  getFundingWindowType: state => state.fundingWindowType,
  getEconomyWindowType: state => state.economyWindowType
}

export const mutations = {
  updateActiveProposals (state, payload) {
    state.activeProposals = payload
  },
  updateCompletedProposals (state, payload) {
    state.completedProposals = payload
  },
  updateActiveDevProposals (state, payload) {
    state.activeDevProposals = payload
  },
  updateFundingWindowType (state, payload) {
    state.fundingWindowType = payload
  },
  updateEconomyWindowType (state, payload) {
    state.economyWindowType = payload
  },
  updateCompletedDevProposals (state, payload) {
    state.completedDevProposals = payload
  }
}

export const actions = {
  async updateActiveProposals (store, payload) {
    store.commit('updateActiveProposals', payload)
  },
  async updateCompletedProposals (store, payload) {
    store.commit('updateCompletedProposals', payload)
  },
  async updateActiveDevProposals (store, payload) {
    store.commit('updateActiveDevProposals', payload)
  },
  async updateFundingWindowType (store, payload) {
    store.commit('updateFundingWindowType', payload)
  },
  async updateEconomyWindowType (store, payload) {
    store.commit('updateEconomyWindowType', payload)
  },
  async updateCompletedDevProposals (store, payload) {
    store.commit('updateCompletedDevProposals', payload)
  }
}
