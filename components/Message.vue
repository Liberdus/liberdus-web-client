<template>
  <v-ons-page>
    <!-- <tool-bar :option="{ menu: true, notification: true, back: false}" /> -->
    <div class="message-tab-container">
      <button
        class="white-button new-message-button"
        @click="$router.push('/message/new')"
      >
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
import MessageListItem from '~/components/MessageListItem'
import { mapGetters, mapActions } from 'vuex'
import { last } from 'lodash'
import utils from '../assets/utils'
import newMessageSoundFile from '../assets/new_message_sound.mp3'
import ToolBar from '~/components/ToolBar'
import Title from '~/components/baisc/Title'
import Button from '~/components/baisc/Button'
export default {
  components: {
    MessageListItem,
    Title,
    Button,
    ToolBar
  },
  data: function () {
    return {}
  },
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState',
      getLastMessage: 'chat/getLastMessage',
      isUIReady: 'chat/isUIReady'
    }),
    shouldRender () {
      let should = this.isUIReady
      return should
    },
    messageList () {
      if (this.getAppState && this.isUIReady) {
        let chats = this.getAppState.data.chats
        let handles = Object.keys(chats)
        let list = []
        for (let handle in chats) {
          if (!chats[handle].messages || chats[handle].messages.length === 0)
            continue
          list.push({
            handle,
            timestamp: last(chats[handle].messages).timestamp,
            lastMessage: last(chats[handle].messages).body
          })
        }
        list = list.sort((a, b) => b.timestamp - a.timestamp)
        return list
      } else {
        return []
      }
    }
  },
  methods: {
    ...mapActions({
      updateAppState: 'chat/updateAppState',
      updateLastMessage: 'chat/updateLastMessage',
      updateLastTx: 'chat/updateLastTx'
    })
  },
  mounted: function () {}
}
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
  border: none;
  background: transparent;
  border: 0px solid blue;
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
