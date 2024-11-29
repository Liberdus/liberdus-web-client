import utils from "../assets/utils";

export const state = () => ({
  appState: null,
  network: null,
  lastMessage: null,
  lastTx: null,
  isUIReady: false,
  notificationQueue: [],
  timers: {},
  windowFocus: true,
  handleDictionary: {},
  polling: {
    enabled: false,
    interval: null,
    lastPolledAt: null
  }
});

export const getters = {
  getAppState: state => state.appState,
  getNetwork: state => state.network,
  getTimers: state => state.timers,
  getLastMessage: state => state.lastMessage,
  getLastTx: state => state.lastTx,
  getNotificationQueue: state => state.notificationQueue,
  isUIReady: state => state.isUIReady,
  getWindowFocus: state => state.windowFocus,
  getHandleDictionary: state => state.handleDictionary
};

export const mutations = {
  SET_POLLING(state, { enabled, interval }) {
    state.polling.enabled = enabled;
    state.polling.interval = interval;
  },
  SET_LAST_POLLED(state, timestamp) {
    state.polling.lastPolledAt = timestamp;
  },
  updateAppState(state, payload) {
    state.appState = payload;
  },
  addTimer(state, payload) {
    state.timers[payload.key] = payload.value;
  },
  updateNetwork(state, payload) {
    state.network = payload;
  },
  setUIReady(state) {
    state.isUIReady = true;
  },
  updateWindowFocus(state, payload) {
    state.windowFocus = payload;
  },
  updateLastMessage(state, payload) {
    state.lastMessage = payload;

    const existingLastMessages = JSON.parse(
      localStorage.getItem("lastMessage")
    );
    if (existingLastMessages) {
      existingLastMessages[payload.walletUsername] = payload;
      localStorage.setItem("lastMessage", JSON.stringify(existingLastMessages));
    } else {
      const obj = {};
      obj[payload.walletUsername] = payload;
      localStorage.setItem("lastMessage", JSON.stringify(obj));
    }
  },
  updateLastTx(state, payload) {
    state.lastTx = payload;
    const existingLastTx = JSON.parse(localStorage.getItem("lastTx"));
    if (existingLastTx) {
      existingLastTx[payload.walletUsername] = payload;
      localStorage.setItem("lastTx", JSON.stringify(existingLastTx));
    } else {
      const obj = {};
      obj[payload.walletUsername] = payload;
      localStorage.setItem("lastTx", JSON.stringify(obj));
    }
  },
  addNotificationQueue(state, payload) {
    state.notificationQueue.push(payload);
  },
  clearNotificationQueue(state) {
    state.notificationQueue = [];
  },
  addHandle(state, payload) {
    state.handleDictionary[payload.address] = payload.handle;
  }
};

export const actions = {
  async startRefreshing({ dispatch, commit, rootGetters }) {
    // Clear any existing polling
    dispatch("stopRefreshing");

    // start very first refresh
    await dispatch("refreshAppState");

    // schedule regular refreshes
    const refreshInterval = setInterval(async () => {
      await dispatch("refreshAppState");
    }, 5000); // Poll every 5 seconds

    commit("SET_POLLING", { enabled: true, interval: refreshInterval });
  },
  stopRefreshing({ state, commit }) {
    if (state.polling.interval) {
      clearInterval(state.polling.interval);
      commit("SET_POLLING", { enabled: false, interval: null });
    }
  },
  async refreshAppState({ dispatch, commit, state, rootGetters }) {
    let self = this;
    let isUIReady = state.isUIReady;
    let getWallet = rootGetters["wallet/getWallet"];
    let windowFocus = state.windowFocus;
    console.log("Refreshing app state...");
    if (!windowFocus) return;
    if (getWallet && isUIReady) {
      let myHandle = getWallet.handle;
      let myAccountData = await utils.queryAccount(myHandle);
      await dispatch("processData", { accountData: myAccountData });
      // await dispatch('refreshProposalList')
      // poll messages now
      await dispatch("chat/pollMessages", null, { root: true });
    }
  },
  async processData({ dispatch, commit, state, rootGetters }, { accountData }) {
    try {
      let { account } = accountData;
      let processed = {
        data: {
          balance: account.data.balance,
          friends: account.data.friends,
          transactions: account.data.transactions,
          chats: account.data.chats
        }
      };

      // Process handles
      let keys = Object.keys(account.data.chats);
      for (let i = 0; i < keys.length; i++) {
        let handle;
        if (state.handleDictionary[keys[i]]) {
          handle = state.handleDictionary[keys[i]];
        } else {
          handle = await utils.getHandle(keys[i]);
          dispatch("addHandle", { address: keys[i], handle });
        }
      }

      let friendList = Object.values(processed.data.friends);
      friendList = friendList.filter(f => f !== null);
      processed.data.friends = friendList;
      dispatch("updateAppState", processed);
    } catch (e) {
      console.warn("Unable to process account state data...", e);
      return null;
    }
  },
  async updateAppState(store, payload) {
    store.commit("updateAppState", payload);
  },
  async addTimer(store, payload) {
    store.commit("addTimer", payload);
  },
  async updateNetwork(store, payload) {
    store.commit("updateNetwork", payload);
  },
  async setUIReady(store) {
    store.commit("setUIReady");
  },
  async updateWindowFocus(store, payload) {
    store.commit("updateWindowFocus", payload);
  },
  async updateLastMessage(store, payload) {
    store.commit("updateLastMessage", payload);
  },
  async updateLastTx(store, payload) {
    store.commit("updateLastTx", payload);
  },
  async addNotificationQueue(store, payload) {
    store.commit("addNotificationQueue", payload);
  },
  async clearNotificationQueue(store) {
    store.commit("clearNotificationQueue");
  },
  async addHandle(store, payload) {
    store.commit("addHandle", payload);
  }
};
