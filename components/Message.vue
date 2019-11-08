<template>
  <v-ons-page>
    <tool-bar :option="{ menu: true, notification: true, back: false}" />
    <div class="message-tab-container">
      <Title text="Messages" />
      <button class="white-button new-message-button" @click="$router.push('/message/new')">
        <v-ons-icon icon="ion-ios-chatboxes" size="lg"></v-ons-icon>New Message
      </button>
      <v-ons-list class="message-list">
        <v-ons-list-item v-for="message in messageList" :key="message.text">
          <nuxt-link v-bind:to="`/message/${message.handle}`" class="nuxt-link">
            <message-list-item :message="message" />
          </nuxt-link>
        </v-ons-list-item>
      </v-ons-list>
    </div>
  </v-ons-page>
</template>

<script>
import MessageListItem from "~/components/MessageListItem";
import { mapGetters, mapActions } from "vuex";
import utils from "../assets/utils";
import * as R from "ramda";
import newMessageSoundFile from "../assets/new_message_sound.mp3";
import ToolBar from "~/components/ToolBar";
import Title from "~/components/baisc/Title";
import Button from "~/components/baisc/Button";
export default {
  components: {
    MessageListItem,
    Title,
    Button,
    ToolBar
  },
  data: function() {
    return {
      messageList: [
        {
          handle: "osyed",
          timestamp: Date.now(),
          lastMessage: "Hi, how is it going ?"
        },
        {
          handle: "asyed",
          timestamp: Date.now(),
          lastMessage: "Sweet !"
        },
        {
          handle: "andrewF",
          timestamp: Date.now(),
          lastMessage: "Awesome !"
        }
      ]
    };
  },
  computed: {
    ...mapGetters({
      getWallet: "wallet/getWallet",
      getAppState: "chat/getAppState",
      getLastMessage: "chat/getLastMessage",
      getLastTx: "chat/getLastTx",
      isUIReady: "chat/isUIReady"
    }),
    shouldRender() {
      let should = this.isUIReady;
      return should;
    }
    // messageList() {
    //   if (this.getAppState && this.isUIReady) {
    //     let chats = this.getAppState.data.chats;
    //     let handles = Object.keys(chats);
    //     let list = [];
    //     for (let handle in chats) {
    //       list.push({
    //         handle,
    //         timestamp: R.takeLast(1, chats[handle].messages)[0].timestamp,
    //         lastMessage: R.takeLast(1, chats[handle].messages)[0].body
    //       });
    //     }
    //     list = list.sort((a, b) => b.timestamp - a.timestamp);
    //     return list;
    //   } else {
    //     return [];
    //   }
    // }
  },
  methods: {
    ...mapActions({
      updateAppState: "chat/updateAppState",
      updateLastMessage: "chat/updateLastMessage",
      updateLastTx: "chat/updateLastTx"
    }),
    async processData(myAccountData) {
      try {
        let { account } = myAccountData;
        let keys = Object.keys(account.data.chats);
        let modifiedChats = {};
        for (let i = 0; i < keys.length; i++) {
          let handle = await utils.getHandle(keys[i]);
          modifiedChats[handle] = account.data.chats[keys[i]];
        }
        let processed = { ...account };
        processed.data.chats = modifiedChats;
        for (var handle in processed.data.chats) {
          processed.data.chats[handle].messages = processed.data.chats[
            handle
          ].messages.map(m => JSON.parse(m));
        }
        let friendList = Object.values(processed.data.friends);
        friendList = friendList.filter(f => f !== null);
        processed.data.friends = friendList;
        return processed;
      } catch (e) {
        console.warn(`Unable to process account state data...`);
        // console.log(myAccountData);
      }
    },
    async refreshAppState() {
      let self = this;
      if (self.getWallet && self.isUIReady) {
        console.log("Refreshing App state...");
        let myHandle = this.getWallet.handle;
        let myAccountData = await utils.queryAccount(myHandle);
        let processedState = await this.processData(myAccountData);
        self.updateAppState(processedState);
        let {
          newLastMessage,
          latestTimestamp,
          handle
        } = this.getNewLastMessage();
        // if (!newLastMessage) return;
        let isMessageRead = this.$route.name === "chathistory-friend";
        // if this is first-time loading
        if (newLastMessage && !this.getLastMessage) {
          this.updateLastMessage({ text: newLastMessage, read: isMessageRead });
        }
        let shouldNotifiyNewMessage =
          Math.abs(latestTimestamp - Date.now()) < 60000 &&
          this.getNewLastMessage &&
          this.getLastMessage.text !== newLastMessage;

        if (shouldNotifiyNewMessage) {
          this.updateLastMessage({ text: newLastMessage, read: isMessageRead });
          if (handle !== myHandle && !this.getLastMessage.read) {
            this.notifyNewMessage(handle, newLastMessage);
            utils.playSoundFile(newMessageSoundFile);
          }
        }
        let lastTxFromAPI = this.getLastTxFromAPI();
        if (lastTxFromAPI) {
          if (!this.getLastTx || this.getLastTx.txId !== lastTxFromAPI.txId) {
            if (lastTxFromAPI.timestamp < Date.now() - 30000) {
              lastTxFromAPI.seen = true;
              this.updateLastTx(lastTxFromAPI);
            } else {
              lastTxFromAPI.seen = false;
              this.updateLastTx(lastTxFromAPI);
            }
            if (!lastTxFromAPI.seen) {
              let processedTx = this.processTx(lastTxFromAPI);
              this.notifyNewTx(processedTx);
              utils.playSoundFile(newMessageSoundFile);
            }
          }
        }
        setTimeout(this.refreshAppState, 10000);
      } else {
        setTimeout(this.refreshAppState, 5000);
      }
    },
    getLastTxFromAPI() {
      if (!this.getAppState) return;
      let txs = this.getAppState.data.transactions;
      return txs[txs.length - 1];
    },
    getNewLastMessage() {
      if (this.messageList.length > 0) {
        let sortedMessageList = this.messageList.sort(
          (a, b) => b.timestamp - a.timestamp
        );
        return {
          newLastMessage: sortedMessageList[0].lastMessage,
          latestTimestamp: sortedMessageList[0].timestamp,
          handle: sortedMessageList[0].handle
        };
      } else
        return {
          newLastMessage: null,
          latestTimestamp: null,
          handle: null
        };
    },
    processTx(tx) {
      let myAddress = this.getWallet.entry.address;
      let type;
      let otherPersonAddress;
      if (tx.type === "transfer") {
        if (tx.srcAcc == myAddress && tx.tgt == myAddress) type = "self";
        else if (tx.srcAcc == myAddress) {
          type = "send";
          otherPersonAddress = tx.tgtAcc;
        } else if (tx.tgtAcc == myAddress) {
          type = "receive";
          otherPersonAddress = tx.srcAcc;
        } else type = "claim";
      } else {
        type = tx.type;
      }
      return {
        type,
        otherPersonAddress,
        timestamp: tx.timestamp,
        amount: tx.amount
      };
    },
    notifyNewMessage(handle, message) {
      this.$notify({
        group: "new-message",
        title: `@${handle}`,
        text: message,
        duration: 8000
      });
    },
    async notifyNewTx(tx) {
      let titleString;
      let otherPersonHandle = await utils.getHandle(tx.otherPersonAddress);
      if (tx.type === "receive") {
        titleString = `Receieved ${tx.amount} Coin from @${otherPersonHandle}`;
      } else if (tx.type === "send") {
        titleString = `Sent ${tx.amount} Coin to @${otherPersonHandle}`;
      }
      this.$notify({
        group: "new-message",
        title: `New Transaction`,
        text: titleString,
        duration: 8000
      });
    }
  },
  mounted: function() {
    this.refreshAppState();
  }
};
</script>

<style>
.message-tab-container {
  width: 90%;
  max-width: 600px;
  margin: 0 auto;
}
.nuxt-link {
  width: 100%;
}
.new-message-btn {
  margin: 20px auto;
  width: 100%;
  text-align: center;
  font-size: 13px;
}
.message-list {
  max-width: 600px;
  margin: 20px auto;
}
.message-list .list-item {
  background: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(206, 206, 206, 0.5);
  border-radius: 5px;
  margin: 10px auto;
  border: none;
  width: 100%;
  padding: 5px 10px;
}
.message-list .list-item .center.list-item__center {
  background: transparent;
}
.new-message-button {
  width: 207px !important;
  height: 55px !important;
  margin: 30px auto;
  align-items: center;
  display: block;
}
</style>
