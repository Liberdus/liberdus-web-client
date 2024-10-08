<template>
  <!-- <v-ons-page class="chat-history-view"> -->
  <!-- <tool-bar
      :option="{
        menu: false,
        notification: false,
        back: true,
        title: `@${friend}`,
        addFriend: isFriend ? null : friend
      }"
    /> -->

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
      <!-- <a-empty
        v-if="(!messages || messages.length === 0) && !pendingMessage"
        description="No messages."
      /> -->
    </div>
    <chat-input
      :friend="friend"
      :is-friend="isFriend"
      :set-pending-message="setPendingMessage"
    />
    <p class="end-of-history">
      End of History
    </p>
  </div>
  <!-- </v-ons-page> -->
</template>

<script>
import Vue from 'vue';
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import VueOnsen from 'vue-onsenui/esm';
import OnsenComponents from '~/components/Onsen';
import ChatText from '~/components/ChatText';
import ChatInput from '~/components/ChatInput';
import { mapGetters, mapActions } from 'vuex';
import utils from '../../assets/utils';
import sentSoundFile from '../../assets/sent_sound.mp3';
import ToolBar from '~/components/ToolBar';
import Title from '~/components/baisc/Title';
import Button from '~/components/baisc/Button';

Vue.use(VueOnsen);
Object.values(OnsenComponents).forEach((c) => Vue.component(c.name, c));

let messagesChanged = false;

export default {
  components: {
    ChatText,
    ChatInput,
    ToolBar,
  },
  layout: 'dashboard',
  validate({ params }) {
    return true;
  },
  data: function() {
    return {
      messages: [],
      refresher: null,
      pendingMessage: null,
      otherPersonAddress: null,
    };
  },
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState',
      isUIReady: 'chat/isUIReady',
    }),
    friend() {
      return this.$route.params.friend;
    },
    isFriend() {
      if (!this.getAppState) return false;
      return this.getAppState.data.friends.indexOf(this.friend) >= 0;
    },
    secretKey() {
      return this.getWallet.entry.keys.secretKey;
    },
  },
  methods: {
    ...mapActions({
      updateAppState: 'chat/updateAppState',
      updateLastMessage: 'chat/updateLastMessage',
    }),
    async refreshMessages() {
      let self = this;
      let myAccountData = await utils.queryAccount(this.getWallet.handle);
      let chats = myAccountData.account.data.chats;
      let chatId = chats[this.otherPersonAddress];
      if (chatId) {
        const encryptedChatList = await utils.queryEncryptedChats(chatId);
        console.log('encryptedChatList', encryptedChatList);
        const decryptedMessages = encryptedChatList.map((sealed) => {
          return utils.decryptMessage(
            sealed,
            self.otherPersonAddress,
            this.secretKey
          );
        });
        // console.log('decrypted', decryptedMessages)
        // console.log('PENDING => ', this.pendingMessage)
        // console.log('MESSAGES => ', this.messages)
        // console.log(decryptedMessages.length, this.messages.length)

        if (decryptedMessages.length > this.messages.length) {
          this.messages = decryptedMessages;
          messagesChanged = true;

          let lastMessage = this.messages[this.messages.length - 1];
          console.log('LAST_MESSAGE => ', lastMessage);
          if (lastMessage.handle !== this.getWallet.handle) {
            this.updateLastMessage({
              ...lastMessage,
              read: true,
              readTimestamp: Date.now(),
              walletUsername: this.getWallet.handle,
            });
          }

          if (this.pendingMessage) {
            console.log('PENDING => ', this.pendingMessage);
            console.log('LAST_MESSAGE => ', lastMessage);
            console.log('LAST_MESSAGE_HASH => ', utils.hashMessage(lastMessage));

            // check if the last message is the same as the pending message
            if (
              this.pendingMessage.handle === lastMessage.handle &&
              this.pendingMessage.messageHash === utils.hashMessage(lastMessage)
            ) {
              this.pendingMessage = null;
              utils.playSoundFile(sentSoundFile);
            }
          }
        }
      }
    },
    onGoBack() {
      clearInterval(this.refresher);
      this.refresher = null;
      this.$router.push('/');
    },
    onClickAddFriend(handle) {
      let self = this;
      this.$confirm({
        title: 'Confirm',
        content: `Confirm to add @${this.friend} to friend list ?`,
        async onOk() {
          if (result === 1) {
            let isSubmitted = await utils.addFriend(
              this.friend,
              this.getWallet.entry.keys
            );
            if (isSubmitted)
              this.notify('Add Friend transaction is submitted.');
          }
        },
      });
      // this.$ons.notification
      //   .confirm(`Confirm to add @${this.friend} to friend list ?`)
      //   .then(async result => {
      //     if (result === 1) {
      //       let isSubmitted = await utils.addFriend(
      //         this.friend,
      //         this.getWallet.entry.keys
      //       )
      //       if (isSubmitted) this.notify('Add Friend transaction is submitted.')
      //     }
      //   })
    },
    notify(message) {
      this.$ons.notification.alert(message);
    },
    setPendingMessage(message) {
      this.pendingMessage = message;
      this.$nextTick(this.scrollToLastMessage);
    },
    scrollToLastMessage() {
      let container = document.querySelector('.chat-history-view');
      let element = document.querySelector('.end-of-history');
      if (element) {
        var topPos = element.offsetTop;
        container.scrollTop = topPos;
      }
    },
  },
  created: async function() {
    this.otherPersonAddress = await utils.getAddress(this.friend);
    this.refreshMessages();
  },
  mounted: async function() {
    let self = this;
    this.refreshMessages();
    this.refresher = setInterval(self.refreshMessages, 5000);
  },
  updated: function() {
    if (messagesChanged) {
      this.$nextTick(this.scrollToLastMessage);
      messagesChanged = false;
    }
  },
  beforeDestroy: function() {
    console.log('Clearing message refresher...');
    clearInterval(this.refresher);
    this.refresher = null;
  },
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
