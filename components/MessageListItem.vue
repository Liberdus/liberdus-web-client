<template>
  <div class="recent-message-list-item">
    <div class="username-timestamp">
      <div class="username">@{{ message.handle }}</div>
      <div class="timestamp">{{ timestamp }}</div>
    </div>
    <div class="last-message-text">{{ message.lastMessage }}</div>
  </div>
</template>

<script>
import moment from "moment";
export default {
  props: ["message"],
  computed: {
    timestamp() {
      return moment(this.message.timestamp).calendar();
    }
  }
};
</script>

<style>
.recent-message-list-item {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.recent-message-list-item .username-timestamp {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.recent-message-list-item .username-timestamp .username {
  font-family: Poppins;
  font-weight: 700;
  font-size: 12px;
  color: #0a2463;
  letter-spacing: -0.17px;
  text-align: left;
}
.recent-message-list-item .username-timestamp .timestamp {
  font-family: Poppins;
  font-size: 13px;
  color: #0a2463;
  letter-spacing: -0.14px;
  text-align: left;
}
.recent-message-list-item .last-message-text {
  font-family: Poppins;
  font-size: 13px;
  color: #535353;
  letter-spacing: -0.14px;
  text-align: left;
}
</style>
