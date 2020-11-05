<template>
  <div style="display: none">
    {{ lastMessage }}
    {{ lastTx }}
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import utils from '../assets/utils'
import newMessageSoundFile from '../assets/new_message_sound.mp3'
export default {
  props: {
    lastMessage: {
      type: Object
    },
    lastTx: {
      type: Object
    }
  },
  data: function () {
    return {}
  },
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState',
      getLastMessage: 'chat/getLastMessage',
      getLastTx: 'chat/getLastTx',
      isUIReady: 'chat/isUIReady'
    })
  },
  updated: function () {
    this.checkMessage()
    this.checkTx()
  },
  methods: {
    ...mapActions({
      updateAppState: 'chat/updateAppState',
      updateLastMessage: 'chat/updateLastMessage',
      updateLastTx: 'chat/updateLastTx',
      addNotificationQueue: 'chat/addNotificationQueue'
    }),
    async processTx (tx) {
      let myAddress = this.getWallet.entry.address
      let type
      let otherPersonAddress
      let otherPersonAlias
      if (tx.type === 'transfer') {
        if (tx.from == myAddress && tx.to == myAddress) type = 'self'
        else if (tx.from == myAddress) {
          type = 'send'
          otherPersonAddress = tx.to
          otherPersonAlias = await utils.getHandle(otherPersonAddress)
        } else if (tx.to == myAddress) {
          type = 'receive'
          otherPersonAddress = tx.from
          otherPersonAlias = await utils.getHandle(otherPersonAddress)
        } else type = 'claim'
      } else {
        type = tx.type
      }
      return {
        type,
        otherPersonAddress,
        otherPersonAlias,
        timestamp: tx.timestamp,
        amount: tx.amount
      }
    },
    notifyNewMessage (handle, message) {
      this.$notify({
        group: 'new-message',
        title: `@${handle}`,
        text: message,
        duration: 15000
      })
      this.addNotificationQueue({
        title: `New Message from @${handle}`,
        text: message,
        id: handle + Date.now(),
        timestamp: Date.now()
      })
      this.updateMessageBadge()
    },
    updateMessageBadge () {
      let self = this
      const lastMessageStored = utils.loadLastMessage(this.getWallet.handle)
      const messagesInMemory = this.getAppState.data.chats
      let messageList = []
      for (let handle in messagesInMemory) {
        messagesInMemory[handle].messages.forEach(m => {
          messageList.push({ ...m })
        })
      }
      let newMessageList = messageList.filter(
        m => m.handle !== self.getWallet.handle
      )
      if (lastMessageStored) {
        newMessageList = messageList.filter(
          m => m.timestamp > lastMessageStored.timestamp
        )
      }

      for (let i = 0; i < newMessageList.length; i++) {
        utils.updateBadge('message', 'increase')
      }
    },
    async notifyNewTx (tx) {
      let textBody
      if (tx.type === 'receive') {
        textBody = `Receieved ${tx.amount} Coins from @${tx.otherPersonAlias}`
      } else if (tx.type === 'send') {
        textBody = `Sent ${tx.amount} Coins to @${tx.otherPersonAlias}`
      } else {
        return
      }
      console.log(textBody)
      // this.$notify({
      //   group: 'new-message',
      //   title: `New Transaction`,
      //   text: textBody,
      //   duration: 5000
      // })

      this.$notification.success({
        message: 'New Transaction',
        description: textBody
      })
      this.addNotificationQueue({
        title: `New Transaction`,
        text: textBody,
        id: tx.otherPersonAlias + Date.now(),
        timestamp: Date.now()
      })
      if (tx.type === 'receive') utils.updateBadge('home', 'increase')
    },
    checkMessage () {
      let shouldNotifiyNewMessage = false
      if (this.lastMessage && !this.getLastMessage) {
        shouldNotifiyNewMessage = true
      } else if (
        this.lastMessage &&
        this.lastMessage.body !== this.getLastMessage.body &&
        this.lastMessage.timestamp > this.getLastMessage.timestamp
      ) {
        shouldNotifiyNewMessage = true
      }
      if (shouldNotifiyNewMessage) {
        if (this.lastMessage.handle !== this.getWallet.handle) {
          this.notifyNewMessage(this.lastMessage.handle, this.lastMessage.body)
          utils.playSoundFile(newMessageSoundFile)
          this.updateLastMessage({
            ...this.lastMessage,
            read: true,
            readTimestamp: Date.now(),
            walletUsername: this.getWallet.handle
          })
        }
      }
    },
    async checkTx () {
      let shouldNotifiyNewTx = false
      if (this.lastTx && !this.getLastTx) {
        shouldNotifiyNewTx = true
      } else if (
        this.lastTx &&
        this.getLastTx.txId !== this.lastTx.txId &&
        this.getLastTx.timestamp < this.lastTx.timestamp
      ) {
        shouldNotifiyNewTx = true
      }
      if (shouldNotifiyNewTx) {
        this.updateLastTx(this.lastTx)
        let processedTx = await this.processTx(this.lastTx)
        this.notifyNewTx(processedTx)
        utils.playSoundFile(newMessageSoundFile)
      }
    }
  }
}
</script>

<style></style>
