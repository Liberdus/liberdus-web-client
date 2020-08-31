<template>
  <v-ons-page>
    <v-ons-list>
      {{ getNotificationQueue }}
      <v-ons-list-item>
        <nuxt-link
          to="/setting/toll"
          class="nuxt-link"
        >
          <div>
            <p class="setting-name">
              Toll
            </p>
            <p class="setting-description">
              Update your toll setting
            </p>
          </div>
        </nuxt-link>
      </v-ons-list-item>
    </v-ons-list>
    <v-ons-button
      class="new-message-btn"
      modifier="quiet"
      @click="onSignOut"
    >
      Sign Out
    </v-ons-button>
  </v-ons-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  computed: {
    ...mapGetters({
      getNotificationQueue: "chat/getNotificationQueue"
    })
  },
  methods: {
    ...mapActions({
      updateAppState: "chat/updateAppState",
      removeWallet: "wallet/removeWallet"
    }),
    onSignOut() {
      this.updateAppState(null);
      this.removeWallet();
      localStorage.removeItem("account");
      localStorage.removeItem("lastMessage");
      localStorage.removeItem("lastTx");
      this.$router.push("/welcome");
    }
  }
};
</script>

<style>
.setting-name {
  font-size: 15px;
  font-weight: bold;
  color: #333333;
  letter-spacing: -0.17px;
  text-align: left;
}
</style>
