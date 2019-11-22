<template>
  <v-ons-page class="chat-history-view">
    <tool-bar :option="{ menu: false, notification: false, back: true, title: `@${friend}`, addFriend: isFriend ? null : friend}" />

    <div v-if="messages.length > 0" class="message-list-container">
      <chat-text v-for="(message, index) in messages" :message="message" :key="`chat${index}`" />
      <chat-text v-if="pendingMessage" :message="pendingMessage" />
    </div>
    <chat-input :friend="friend" :isFriend="isFriend" :setPendingMessage="setPendingMessage" />
    <p class="end-of-history">End of History</p>
  </v-ons-page>
</template>

<script>
import Vue from "vue";
import "onsenui/css/onsenui.css";
import "onsenui/css/onsen-css-components.css";
import VueOnsen from "vue-onsenui/esm";
import OnsenComponents from "~/components/Onsen";
import ChatText from "~/components/ChatText";
import ChatInput from "~/components/ChatInput";
import { mapGetters, mapActions } from "vuex";
import utils from "../../assets/utils";
import sentSoundFile from "../../assets/sent_sound.mp3";
import ToolBar from "~/components/ToolBar";
import Title from "~/components/baisc/Title";
import Button from "~/components/baisc/Button";

Vue.use(VueOnsen);
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c));

export default {
  components: {
    ChatText,
    ChatInput,
    ToolBar
  },
  validate({ params }) {
    return true;
  },
  data: function() {
    return {
      messages: [null],
      refresher: null,
      pendingMessage: null
    };
  },
  computed: {
    ...mapGetters({
      getWallet: "wallet/getWallet",
      getAppState: "chat/getAppState",
      isUIReady: "chat/isUIReady"
    }),
    friend() {
      return this.$route.params.friend;
    },
    isFriend() {
      if (!this.getAppState) return false;
      return this.getAppState.data.friends.indexOf(this.friend) >= 0;
    }
  },
  methods: {
    ...mapActions({
      updateAppState: "chat/updateAppState",
      updateLastMessage: "chat/updateLastMessage"
    }),
    async refreshChatHistory() {
      // console.log("Refreshing chat history...");
      let self = this;
      let messages = await utils.getMessages(
        this.getWallet.entry,
        this.friend,
        this.startTimestamp
      );
      if (messages) {
        let newMessages = messages.map(m => JSON.parse(m));
        if (newMessages.length > this.messages) {
          setTimeout(this.scrollToLastMessage, 1000);
        }
        this.messages = messages.map(m => JSON.parse(m));
        let lastMessage = this.messages[this.messages.length - 1];
        if (lastMessage.handle !== this.getWallet.handle)
          this.updateLastMessage({ text: lastMessage.body, read: true });
        if (this.pendingMessage) {
          if (
            this.pendingMessage.handle === lastMessage.handle &&
            this.pendingMessage.body === lastMessage.body
          ) {
            this.pendingMessage = null;
            utils.playSoundFile(sentSoundFile);
          }
        }
      }
    },

    onGoBack() {
      clearInterval(this.refresher);
      this.refresher = null;
      this.$router.push("/");
    },
    onClickAddFriend(handle) {
      let self = this;
      this.$ons.notification
        .confirm(`Confirm to add @${this.friend} to friend list ?`)
        .then(async result => {
          if (result === 1) {
            let isSubmitted = await utils.addFriend(
              this.friend,
              this.getWallet.entry.keys
            );
            if (isSubmitted)
              this.notify("Add Friend transaction is submitted.");
          }
        });
    },
    notify(message) {
      this.$ons.notification.alert(message);
    },
    setPendingMessage(message) {
      this.pendingMessage = message;
    },
    scrollToLastMessage() {
      let container = document.querySelector(
        ".chat-history-view .page__content"
      );
      let element = document.querySelector(".end-of-history");
      var topPos = element.offsetTop;
      container.scrollTop = topPos;
    }
  },
  mounted() {
    let self = this;
    this.refresher = setInterval(self.refreshChatHistory, 2000);
  }
};
</script>

<style>
.chat-history-view .toolbar__right {
  padding-right: 20px;
}
.chat-history-view .page__content {
  height: calc(100vh - 114px);
}
.end-of-history {
  visibility: hidden;
}
.message-list-container {
  padding: 20px;
}
</style>
