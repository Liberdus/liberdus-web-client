<template>
  <div
    class="chat-text-container"
    v-bind:class="{ isUser: isUser, isFriend: isFriend, isPending: isPending}"
    v-if="message !== null"
  >
    <div class="chat">
      <p class="chat-message">{{ message.body }}</p>
      <p class="chat-timestamp">{{ formattedTimestamp }}</p>
    </div>
  </div>
</template>

<script>
import MessageListItem from "~/components/MessageListItem";
import { mapGetters } from "vuex";
import moment from "moment";
export default {
  props: ["message"],
  computed: {
    ...mapGetters({
      getWallet: "wallet/getWallet",
      getAppState: "chat/getAppState",
      isUIReady: "chat/isUIReady"
    }),
    isUser() {
      // TODO:
      // return this.message.handle === this.getWallet.handle;
      return this.message.handle === "thantsintoe";
    },
    isFriend() {
      return !this.isUser;
    },
    isPending() {
      return this.message.timestamp === null;
    },
    formattedTimestamp() {
      if (this.isPending) return "pending...";
      else return moment(this.message.timestamp).calendar();
    }
  },
  mounted() {
    console.log("mounted chat text...");
  }
};
</script>

<style>
.chat-text-container {
  display: flex;
}
.chat-text-container .chat {
  width: auto;
  padding: 10px;
  margin: 5px;
  border: 1px solid #f0f0f0;
  border-radius: 5px;
  max-width: 50%;
  font-size: 12px;
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
}
.chat-text-container.isUser {
  justify-content: flex-end;
}
.chat-text-container.isFriend {
  justify-content: flex-start;
}
.chat-text-container.isUser .chat {
  background: #e6eef6;
  background: rgba(143, 209, 251, 0.23);
  box-shadow: 0 2px 4px 0 rgba(206, 206, 206, 0.5);
  border-radius: 10px;
}
.chat-text-container.isFriend .chat {
  background: #f2f2f2;
  background: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(206, 206, 206, 0.5);
  border-radius: 10px;
}
.chat-text-container.isPending .chat {
  background: #e8e8e8;
  border: 1px solid #d7d6d6;
}
.chat-text-container.isUser .chat-timestamp {
  text-align: right;
  font-size: 10px;
  color: #888;
  margin-top: 5px;
}
.chat-text-container.isFriend .chat-timestamp {
  text-align: left;
  font-size: 10px;
  color: #888;
  margin-top: 5px;
}
</style>
