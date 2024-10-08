<template>
  <!-- <v-ons-page> -->
  <!-- <tool-bar :option="{ menu: true, notification: true, back: false}" /> -->
  <div class="message-tab-container">
    <!-- <button
        class="white-button new-message-button"
        @click="$router.push('/message/new')"
      >
        <v-ons-icon icon="ion-ios-chatboxes" size="lg"></v-ons-icon>New Message
      </button> -->
    <a-row 
      type="flex" 
      justify="space-around" 
      align="middle" 
      class="new-button-row"
    >
      <a-button
        type="primary"
        shape="round"
        icon="plus"
        size="large"
        @click="$router.push('/message/new')"
      >
        New Message
      </a-button>
    </a-row>

    <a-divider>Messages List</a-divider>

    <a-list item-layout="horizontal" :data-source="messageList">
        <a-list-item slot="renderItem" :key="index" slot-scope="message, index">
          <nuxt-link :to="`/message/${message.handle}`">
            <a-list-item-meta
              :key="index"
              :description="message.lastMessage"
            >
              <span slot="title">{{ message.handle }}</span>
              <a-avatar slot="avatar" style="backgroundColor:#87d068" icon="user" />
            </a-list-item-meta>
          </nuxt-link>
          <div class="message-list-item-timestamp">{{ message.timestampStr }}</div>
        </a-list-item>
    </a-list>
  </div>
  <!-- </v-ons-page> -->
</template>

<script>
import MessageListItem from '~/components/MessageListItem'
import moment from "moment";
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
          if (!chats[handle].messages || chats[handle].messages.length === 0) {
            console.log('no messages')
            continue
          }

          list.push({
            handle,
            timestamp: last(chats[handle].messages).timestamp,
            timestampStr: moment(last(chats[handle].messages).timestamp).calendar(),
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

<style lang="scss">
.new-button-row {
  margin-top: 30px;
}
.message-tab-container {
  width: 90%;
  max-width: 600px;
  margin: 0 auto;

  .ant-avatar {
    margin-top: 7px;
  }
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

@media only screen and (max-width: 600px) {
  .message-tab-container {
    .ant-list-item {
      flex-direction: column;
      align-items: baseline;
    }

    .message-list-item-timestamp {
      width: 100%;
      text-align: right;
      margin-top: 5px;
    }
  }
}
</style>
