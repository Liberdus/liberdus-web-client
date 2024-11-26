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
      <chat-text v-if="pendingMessage" :message="pendingMessage" />
    </div>

    <chat-input
      v-if="
        otherPersonPublicKey &&
          otherPersonAddress &&
          isRatchetInitialized &&
          chatId
      "
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
      messages: [],
      refresher: null,
      pendingMessage: null,
      otherPersonAddress: null,
      otherPersonPublicKey: null,
      sessionId: null,
      totalMessages: 0
    };
  },
  computed: {
    ...mapGetters({
      getWallet: "wallet/getWallet",
      getAppState: "chat/getAppState",
      getRatchet: "ratchet/getRatchet",
      isUIReady: "chat/isUIReady",
      isRatchetInitialized: "ratchet/isInitialized",
      getRatchetState: "ratchet/getRatchetState"
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
      updateLastMessage: "chat/updateLastMessage",
      createRatchet: "ratchet/createOrRestoreRatchet",
      initializeRatchetSession: "ratchet/initializeRatchet",
      decryptMessage: "ratchet/decryptMessage",
      loadPersistedStates: "ratchet/loadPersistedStates"
    }),

    async initializeRatchet() {
      try {
        console.log("======= INITIALIZING RATCHET IN _FRIEND =======");
        // Load any persisted ratchet states
        const persistedStates = await this.loadPersistedStates();
        const chatId = this.chatId
        console.log("persistedStates", persistedStates);

        // Get existing chat history
        let myAccountData = await utils.queryAccount(this.getWallet.handle);
        let chats = myAccountData.account.data.chats;
        console.log("chats", chats);
        const hasExistingChat = chats[this.otherPersonAddress] && chats[this.otherPersonAddress] === chatId;

        console.log("hasExistingChat", hasExistingChat);

        if (!persistedStates.persistedStates[chatId]) {
          console.log('No persisted state for chat:', chatId, 'Creating new ratchet...')
          // Create new ratchet for existing chat
          await this.createRatchet({
            chatId,
            keyPair: this.getWallet.entry.keys,
            isInitiator: false // We're receiving messages in an existing chat
          })

          // Initialize with other person's public key
          await this.initializeRatchetSession({
            chatId,
            // convert to Uint8Array
            remotePublicKey: secpUtils.hexToBytes(this.otherPersonPublicKey),
          })
        } else {
          console.log('Restoring persisted state for chat:', chatId)
          // Restore ratchet with persisted state
          await this.createRatchet({
            chatId,
            keyPair: this.getWallet.entry.keys,
            isInitiator: false, // We're receiving messages in an existing chat
            existingState: persistedStates.persistedStates[chatId]
          })
          // Initialize with other person's public key
          await this.initializeRatchetSession({
            chatId,
            // convert to Uint8Array
            remotePublicKey: secpUtils.hexToBytes(this.otherPersonPublicKey),
          })
        }
      } catch (error) {
        console.error("Failed to initialize ratchet:", error);
      }
      console.log('State after initializing ratchet:', this.getRatchetState(this.chatId));
      console.log("======= DONE INITIALIZING RATCHET IN _FRIEND =======");
    },
    async refreshMessages() {
      try {
        let myAccountData = await utils.queryAccount(this.getWallet.handle);
        let chats = myAccountData.account.data.chats;
        const persistedStates = await this.loadPersistedStates();
        console.log(
          "Persisted states:",
          Object.keys(persistedStates),
          persistedStates.persistedStates
        );

        if (this.chatId) {
          const chatId = this.chatId;
          const encryptedChatList = await utils.queryEncryptedChats(
            this.chatId,
            this.otherPersonPublicKey
          );
          if (encryptedChatList.length === this.totalmessages) {
            console.log("No new messages");
            return;
          }

          this.totalmessages = encryptedChatList.length;

          const existingRatchet = this.getRatchet(this.chatId);
          console.log("Existing ratchet:", existingRatchet);

          if (!existingRatchet) {
            // we should have a ratchet for this chat
            throw new Error("Ratchet not initialized for chat ID:", chatId);
          }

          // Decrypt messages using ratchet
          const decryptedMessages = await Promise.all(
            encryptedChatList.map(async sealed => {
              try {
                const decryptedStr = await this.decryptMessage({
                  chatId,
                  encryptedMessage: sealed.message
                });
                console.log("Decrypted message:", decryptedStr);
                return JSON.parse(decryptedStr);
              } catch (error) {
                console.error("Failed to decrypt message:", error);
                return null;
              }
            })
          );

          // Filter out any failed decryptions
          const validMessages = decryptedMessages.filter(msg => msg !== null);

          if (validMessages.length > this.messages.length) {
            this.messages = validMessages;
            messagesChanged = true;

            let lastMessage = this.messages[this.messages.length - 1];
            if (lastMessage.handle !== this.getWallet.handle) {
              this.updateLastMessage({
                ...lastMessage,
                read: true,
                readTimestamp: Date.now(),
                walletUsername: this.getWallet.handle
              });
            }

            if (
              this.pendingMessage &&
              this.pendingMessage.handle === lastMessage.handle &&
              this.pendingMessage.messageHash === utils.hashMessage(lastMessage)
            ) {
              this.pendingMessage = null;
              utils.playSoundFile(sentSoundFile);
            }
          }
        }
      } catch (error) {
        console.error("Error refreshing messages:", error);
      }
    },

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
      console.log("Creating new chat ID:", newChatId);
      this.chatId = newChatId;
    }
    console.log("Chat ID:", this.chatId);

    if (this.chatId) {
      // Initialize ratchet with existing chat ID
      await this.initializeRatchet();
      await this.refreshMessages();
    }
  },

  mounted: async function() {
    this.refresher = setInterval(this.refreshMessages.bind(this), 5000);
  },

  updated: function() {
    if (messagesChanged) {
      this.$nextTick(this.scrollToLastMessage);
      messagesChanged = false;
    }
  },

  beforeDestroy: function() {
    console.log("Clearing message refresher...");
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
