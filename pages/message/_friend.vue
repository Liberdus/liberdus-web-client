<template>
  <div class="chat-history-view">
    <portal to="navigation-tags">
      <a-breadcrumb>
        <a-breadcrumb-item>
          <nuxt-link to="/message">Message</nuxt-link>
        </a-breadcrumb-item>
        <a-breadcrumb-item>
          <nuxt-link to="/message/new">New Message</nuxt-link>
        </a-breadcrumb-item>
        <a-breadcrumb-item>Chatroom</a-breadcrumb-item>
      </a-breadcrumb>
    </portal>

    <div class="message-list-container">
      <chat-text
        v-for="(message, index) in messages"
        :key="`chat${index}`"
        :message="message"
      />
      <div v-if="pendingMessages.length > 0">
        <chat-text
          v-for="msg in pendingMessages"
          :key="msg.timestamp"
          :message="msg"
        />
      </div>
    </div>

    <chat-input
      v-if="otherPersonPublicKey && otherPersonAddress && chatId"
      :friend="friend"
      :chat-id="chatId"
      :is-friend="isFriend"
      :friend-address="otherPersonAddress"
      :friend-pk="otherPersonPublicKey"
      :set-pending-message="setPendingMessage"
    />
    <p class="end-of-history">
      End of History
    </p>
  </div>
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
import * as crypto from "@shardus/crypto-web";
import { secpUtils } from "@thant-dev/ciphersuite";

Vue.use(VueOnsen);
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c));

let messagesChanged = false;

export default {
  components: {
    ChatText,
    ChatInput
  },
  layout: "dashboard",
  validate({ params }) {
    return true;
  },
  data: function() {
    return {
      chatId: null,
      refresher: null,
      otherPersonAddress: null,
      otherPersonPublicKey: null,
      sessionId: null,
      totalMessages: 0
    };
  },
  computed: {
    ...mapGetters({
      getWallet: "wallet/getWallet",
      getAppState: "app/getAppState",
      isUIReady: "app/isUIReady",
      chats: "chat/getChats",
      getPendingMessages: "chat/getPendingMessages"
    }),
    friend() {
      return this.$route.params.friend;
    },
    isFriend() {
      if (!this.getAppState) return false;
      return this.getAppState.data.friends.indexOf(this.friend) >= 0;
    },
    messages() {
      if (this.chatId && this.otherPersonAddress) {
        let chat = this.chats[this.otherPersonAddress];
        if (chat) {
          let messages = chat.messages;
          messagesChanged = true;
          return messages;
        }
      }
      return [];
    },
    pendingMessages() {
      return this.$store.getters["chat/getPendingMessages"](this.chatId);
    }
  },
  methods: {
    ...mapActions({
      updateAppState: "app/updateAppState",
      updateLastMessage: "app/updateLastMessage"
    }),
    setPendingMessage(message) {
      this.pendingMessage = message;
      this.$nextTick(this.scrollToLastMessage);
    },

    scrollToLastMessage() {
      let container = document.querySelector(".chat-history-view");
      let element = document.querySelector(".end-of-history");
      if (element) {
        var topPos = element.offsetTop;
        container.scrollTop = topPos;
      }
    }
  },
  created: async function() {
    this.otherPersonAddress = await utils.getAddress(this.friend);
    this.otherPersonPublicKey = await utils.getAccountPublicKey(
      this.otherPersonAddress
    );
    // Get or create chat ID
    let myAccountData = await utils.queryAccount(this.getWallet.handle);
    let chats = myAccountData.account.data.chats;
    this.chatId = chats[this.otherPersonAddress];
    if (this.chatId == null) {
      const newChatId = crypto.hash(
        [this.getWallet.entry.address, this.otherPersonAddress].sort().join``
      );
      this.chatId = newChatId;
    }
    if (this.chatId) {
      // Initialize the chat first
      await this.$store.dispatch("chat/initializeChat", {
        otherPersonAddress: this.otherPersonAddress,
        chatId: this.chatId
      });
    }
  },
  mounted: async function() {},
  updated: function() {
    if (messagesChanged) {
      this.$nextTick(this.scrollToLastMessage);
      messagesChanged = false;
    }
  },
  beforeDestroy: function() {
    clearInterval(this.refresher);
    this.refresher = null;
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
