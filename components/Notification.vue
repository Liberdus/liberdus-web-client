<template>
  <div style="display: none">
    {{ lastMessage }}
    {{ lastTx }}
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import utils from "../assets/utils";
import newMessageSoundFile from "../assets/new_message_sound.mp3";
export default {
  data: function() {
    return {};
  },
  props: {
    lastMessage: {
      type: Object
    },
    lastTx: {
      type: Object
    }
  },
  computed: {
    ...mapGetters({
      getWallet: "wallet/getWallet",
      getAppState: "chat/getAppState",
      getLastMessage: "chat/getLastMessage",
      getLastTx: "chat/getLastTx",
      isUIReady: "chat/isUIReady"
    })
  },
  updated: function() {
    this.checkMessage();
    this.checkTx();
  },
  methods: {
    ...mapActions({
      updateAppState: "chat/updateAppState",
      updateLastMessage: "chat/updateLastMessage",
      updateLastTx: "chat/updateLastTx",
      addNotificationQueue: "chat/addNotificationQueue"
    }),
    async processTx(tx) {
      let myAddress = this.getWallet.entry.address;
      let type;
      let otherPersonAddress;
      let otherPersonAlias;
      if (tx.type === "transfer") {
        if (tx.from == myAddress && tx.to == myAddress) type = "self";
        else if (tx.from == myAddress) {
          type = "send";
          otherPersonAddress = tx.to;
          otherPersonAlias = await utils.getHandle(otherPersonAddress);
        } else if (tx.to == myAddress) {
          type = "receive";
          otherPersonAddress = tx.from;
          otherPersonAlias = await utils.getHandle(otherPersonAddress);
        } else type = "claim";
      } else {
        type = tx.type;
      }
      return {
        type,
        otherPersonAddress,
        otherPersonAlias,
        timestamp: tx.timestamp,
        amount: tx.amount
      };
    },
    notifyNewMessage(handle, message) {
      this.$notify({
        group: "new-message",
        title: `@${handle}`,
        text: message,
        duration: 15000
      });
      this.addNotificationQueue({
        title: `New Message from @${handle}`,
        text: message,
        id: handle + Date.now(),
        timestamp: Date.now()
      });
    },
    async notifyNewTx(tx) {
      let textBody;
      if (tx.type === "receive") {
        textBody = `Receieved ${tx.amount} Coin from @${tx.otherPersonAlias}`;
      } else if (tx.type === "send") {
        textBody = `Sent ${tx.amount} Coin to @${tx.otherPersonAlias}`;
      } else {
        return;
      }
      console.log(textBody);
      this.$notify({
        group: "new-message",
        title: `New Transaction`,
        text: textBody,
        duration: 5000
      });
      this.addNotificationQueue({
        title: `New Transaction`,
        text: textBody,
        id: tx.otherPersonAlias + Date.now(),
        timestamp: Date.now()
      });
    },
    checkMessage() {
      let shouldNotifiyNewMessage = false;
      if (
        this.lastMessage &&
        this.lastMessage.body !== this.getLastMessage.body
      ) {
        this.updateLastMessage({
          body: this.lastMessage.body,
          read: false
        });
        shouldNotifiyNewMessage = true;
      }
      if (shouldNotifiyNewMessage) {
        if (this.lastMessage.handle !== this.getWallet.handle) {
          this.notifyNewMessage(this.lastMessage.handle, this.lastMessage.body);
          utils.playSoundFile(newMessageSoundFile);
        }
      }
    },
    async checkTx() {
      if (this.lastTx && this.getLastTx.txId !== this.lastTx.txId) {
        this.updateLastTx(this.lastTx);
        let processedTx = await this.processTx(this.lastTx);
        this.notifyNewTx(processedTx);
        utils.playSoundFile(newMessageSoundFile);
      }
    }
  }
};
</script>

<style>
</style>
