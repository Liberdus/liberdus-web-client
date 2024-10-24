<template>
  <div
    v-if="message !== null"
    class="chat-text-container"
    :class="{ isUser: isUser, isFriend: isFriend, isPending: isPending }"
  >
    <a-row style="width: 100%">
      <a-col :span="24">
        <p class="chat-timestamp">
          {{ formattedTimestamp }}
        </p>
      </a-col>

      <a-col :span="24" class="chat-message-col">
        <div class="chat">
          <div v-if="isPending">
            <img class="attached-img" v-if="pendingMessage.attachment" :src="pendingMessage.attachment"
                 alt="avatar"/>
            <br v-if="pendingMessage.attachment">
          </div>
          <div v-else>
            <img class="attached-img" v-if="confirmedMessage.attachment" :src="confirmedMessage.attachment"
                 alt="avatar"/>
            <br v-if="confirmedMessage.attachment">
          </div>

          <div class="chat-raw-text">
            <p v-if="isPending" class="chat-message">
              {{ pendingMessage.text }}
            </p>
            <p v-else class="chat-message">
              {{ confirmedMessage.text }}
            </p>
          </div>

        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import MessageListItem from '~/components/MessageListItem'
import { mapGetters } from 'vuex'
import moment from 'moment'
export default {
  props: ['message'],
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState',
      isUIReady: 'chat/isUIReady'
    }),
    isUser () {
      return this.message.handle === this.getWallet.handle
    },
    isFriend () {
      return !this.isUser
    },
    isPending () {
      return this.message.timestamp === null
    },
    pendingMessage() {
      try {
        return JSON.parse(this.message.message).body
      } catch (e) {
        console.log(this.message.message)
        return 'parse error'
      }
    },
    confirmedMessage () {
      return this.message.body
    },
    formattedTimestamp () {
      if (this.isPending) return 'pending...'
      else return moment(this.message.timestamp).calendar()
    }
  },
  mounted () {
    console.log('mounted chat text...', this.message, this.message.body)
    if (typeof this.message.body === 'string') {
      try {
        this.message.body = JSON.parse(this.message.body)
      } catch (e) {
        console.log('error parsing message body', e)
      }
    }
  }
}
</script>

<style lang="scss">
.chat-text-container {
  display: flex;
}
.chat-text-container .chat {
  width: auto;
  //padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  max-width: 70%;
  font-size: 12px;
  display: inline-block;
}
.chat-text-container {
  max-width: 600px;
  margin: 0 auto;
}
.chat-text-container .chat .chat-message {
  user-select: text;
  font-family: Poppins;
  font-size: 12px;
  color: #4d4d4d;
  letter-spacing: -0.13px;
  text-align: left;
  line-height: 17px;
  margin-bottom: 2px;
  display: inline-block;
}
.chat-text-container.isUser {
  justify-content: flex-end;

  .chat-message-col {
    text-align: right;
  }
}
.chat-text-container.isPending {
  .chat-message-col {
    text-align: right;
  }
}
.chat-text-container.isFriend {
  justify-content: flex-start;

  .chat-message-col {
    text-align: left;
  }
}
.chat-text-container.isUser .chat .chat-raw-text {
  background: #dbf4fd;
  border-radius: 5px;
  margin-left: auto;
  padding: 5px 10px;
}
.chat-text-container.isFriend .chat .chat-raw-text {
  background: #f2f6f9;
  border-radius: 5px;
  padding: 5px 10px;
}
.chat-text-container.isPending .chat .chat-raw-text {
  background: #e8e8e8;
  border: 1px solid #d7d6d6;
  margin-left: auto;
  padding: 5px 10px;
}
.chat-text-container.isUser .chat-timestamp {
  text-align: right;
}
.chat-text-container.isFriend .chat-timestamp {
  text-align: left;
}
.chat-text-container .chat-timestamp {
  font-size: 10px;
  color: #888;
  margin: 5px;
}
</style>
