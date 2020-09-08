<template>
  <!-- <v-ons-page> -->
  <div>
    <!-- <tool-bar :option="{ menu: false, notification: false, back: true}" /> -->
    <div class="new-message-input-container">
      <a-input
        ref="username-input"
        v-model="alias"
        type="text"
        placeholder="Search a username"
        @keyup="searchAlias"
        size="large"
      />
    </div>
    <!-- <v-ons-list class="found-alias-list">
      <v-ons-list-item
        v-for="alias in availabeAlias"
        :key="alias"
      >
        <nuxt-link
          :to="`/message/${alias}`"
          class="nuxt-link"
        >
          @{{ alias }}
        </nuxt-link>
      </v-ons-list-item>
    </v-ons-list> -->

    <a-list bordered :data-source="availabeAlias" class="available-alias-list">
      <a-list-item slot="renderItem" slot-scope="alias, index" :key="index">
        <nuxt-link 
          :key="index"
          :to="`/message/${alias}`"
          style="width: 100%;"
        >
          <div style="width: 100%;">
            <a-list-item-meta
              :key="index"
            >
              <span slot="title">{{ alias }}</span>
              <a-avatar slot="avatar" style="backgroundColor:#87d068" icon="user" />
            </a-list-item-meta>
          </div>
        </nuxt-link>
      </a-list-item>
    </a-list>

    <div class="current-friend-list">
      <a-divider>Friends list</a-divider>
      <!-- <v-ons-list v-if="getAppState"> -->
      <!-- <v-ons-list>
        <nuxt-link
          v-for="alias in getAppState.data.friends"
          :key="alias"
          :to="`/message/${alias}`"
          class="nuxt-link"
        >
          <v-ons-list-item>
            <p>@{{ alias }}</p>
            <v-ons-icon
              icon="ion-ios-person"
              size="lg"
            />
          </v-ons-list-item>
        </nuxt-link>
      </v-ons-list> -->

      <a-list :grid="{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 3 }" :data-source="getAppState.data.friends">
        <a-list-item slot="renderItem" slot-scope="alias, index" :key="index">
          <nuxt-link 
            :key="index"
            :to="`/message/${alias}`"
          >
            <a-card class="friends-list-item-card">
              <a-list-item-meta
                :key="index"
              >
                <span slot="title">{{ alias }}</span>
                <a-avatar slot="avatar" style="backgroundColor:#87d068" icon="user" />
              </a-list-item-meta>
            </a-card>
          </nuxt-link>
        </a-list-item>
      </a-list>
    </div>
  <!-- </v-ons-page> -->
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
import utils from "../../assets/utils";
import { mapGetters } from "vuex";
import ToolBar from "~/components/ToolBar";
import Title from "~/components/baisc/Title";
import Button from "~/components/baisc/Button";

Vue.use(VueOnsen);
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c));

export default {
  components: {
    ChatText,
    ChatInput,
    ToolBar,
    Title,
    Button
  },
  layout: 'dashboard',
  validate({ params }) {
    return true;
  },
  data: function() {
    return {
      alias: "",
      availabeAlias: []
    };
  },
  computed: {
    ...mapGetters({
      getWallet: "wallet/getWallet",
      getAppState: "chat/getAppState",
      isUIReady: "chat/isUIReady"
    }),
    friend() {
      return this.$route.params.friend;
    }
  },
  mounted() {
    this.$refs['username-input'].focus()
  },
  methods: {
    async searchAlias() {
      if (this.alias) this.alias = this.alias.toLowerCase();
      let queryAccount = await utils.queryAccount(this.alias);
      if (
        queryAccount.account &&
        queryAccount.account.alias !== this.getWallet.handle
      ) {
        this.availabeAlias = [queryAccount.account.alias];
      } else if (this.alias.length === 0) {
        this.availabeAlias = [];
      }
    }
  }
};
</script>

<style lang="scss">
.new-message-input-container {
  height: 70px;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 90%;
  max-width: 600px;
  z-index: 100;
  margin: 20px auto;
}
.new-message-input {
  height: 40px;
  width: 90%;
  max-width: 600px;
  padding: 5px 10px;
  background: #fff;
  border: 1px solid #dddddd;
  border-radius: 5px;
}
.available-alias-list {
  max-width: 600px;
  margin: auto;

  .ant-list-empty-text {
    display: none;
  }
}
.current-friend-list {
  padding: 20px;
  width: 90%;
  max-width: 600px;
  margin: 20px auto;

  .friends-list-item-card {
    .ant-card-body {
      padding: 16px;
    }
  }
}
.current-friend-list .list-item {
  background: #fbfbfb;
  border: none;
}
.current-friend-list .list-item .ons-icon {
  font-size: 30px;
  color: #0a2463;
}
.current-friend-list .list-item .list-item__center {
  display: flex;
  justify-content: space-between;
}
.found-alias-list {
  border: none;
  background: transparent;
  width: 90%;
}
.found-alias-list .list-item {
  background: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(206, 206, 206, 0.5);
  border-radius: 5px;
  margin: 10px auto;
  width: 100%;
  max-width: 600px;
}
</style>
