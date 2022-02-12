<template>
  <v-ons-page>
    <div class="welcome-container" :style="{ backgroundImage: `url(${backgroundUrl})` }">
      <div class="welcome-content">
        <!-- <Title text="Getting Started" /> -->
        <a-row type="flex" justify="space-around" :gutter="[20, 20]">
          <a-col :span="24">
            <h1>Get Started</h1>
          </a-col>
          <a-col :span="24">
            <h2>Welcome to the Liberdus web wallet v{{ version }}</h2>
          </a-col>
          <a-col :span="12">
            <a-button type="primary" size="large" @click="onCreateAccount" :disabled="btnDisabled">
              Sign In
            </a-button>
          </a-col>
          <a-col :span="12">
            <a-button size="large" @click="onImportAccount" :disabled="btnDisabled">
              Import Account
            </a-button>
          </a-col>
          <a-col :span="12">
            <p style="text-align: center">
              Change network setting
              <nuxt-link class="link-to-import" to="/setting/network">
                <strong>here</strong> </nuxt-link
              >.
            </p>
          </a-col>
        </a-row>

        <!-- <a-button type="primary">
          Primary
        </a-button>
        <Button text="Sign In or Create Account" :onClick="onCreateAccount" />
        <Button-Outline text="Import Account" :onClick="onImportAccount" /> -->
        <!-- <p class="version">
          <em>V {{ version }}</em>
        </p> -->
      </div>
    </div>
  </v-ons-page>
</template>

<script>
import Vue from 'vue';
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import VueOnsen from 'vue-onsenui/esm';
// import { Button } from 'ant-design-vue';
import OnsenComponents from '~/components/Onsen';
import ChatText from '~/components/ChatText';
import ChatInput from '~/components/ChatInput';
import Title from '~/components/basic/Title';
import Button from '~/components/basic/Button';
import ButtonOutline from '~/components/basic/ButtonOutline';
import backgroundUrl from '~/assets/images/liberdus_background.png';
import config from '~/config';
import utils from '../assets/utils';

Vue.use(VueOnsen);
// Vue.use(Button)
Object.values(OnsenComponents).forEach((c) => Vue.component(c.name, c));
export default {
  components: { Button, ButtonOutline, Title },
  data: function() {
    return {
      username: '',
      backgroundUrl,
      version: config.version,
      btnDisabled: false,
    };
  },
  methods: {
    onCreateAccount() {
      this.$router.push('/createaccount');
    },
    onImportAccount() {
      this.$router.push('/setting/import');
    },
  },
  async mounted() {
    let self = this;
    let randomHost;
    try {
      randomHost = await utils.getRandomHost();
    } catch (e) {
      console.log('Cannot get a random host');
      this.btnDisabled = true;
      // this.$ons.notification.alert(
      //   "Seed Node server is offline. Please change the seed node from network settings."
      // );
      // self.setUIReady();
      // this.$router.push("/welcome");
    }
  },
};
</script>

<style lang="scss">
.welcome-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  /* max-width:600px; */
  height: 100vh;
  background: #fbfbfb;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position-x: center;
  background-position-y: 100px;

  h1 {
    margin: 0px;
    text-align: center;
    font-size: 48px;
  }

  h2 {
    margin-top: 0px;
    text-align: center;
    font-size: 20px;
  }

  .ant-btn {
    width: 100%;
  }
}

.welcome-container .new-message-btn {
  font-size: 11px;
  color: #43b8e7;
}
.welcome-container .welcome-content {
  width: 90%;
  max-width: 600px;
}

#getting-started {
  font-size: 27px;
  color: #43b8e7;
  letter-spacing: -0.3px;
  text-align: left;
  margin-bottom: 30px;
}

.import-user-btn {
  margin: 20px;
  background: #ffffff;
  border: 2px solid #43b8e7;
  border-radius: 30px;
  font-family: HelveticaNeue-Medium;
  font-size: 13px;
  color: #43b8e7;
  letter-spacing: -0.14px;
  text-align: center;
  margin-bottom: 5px;
}
.version {
  margin: 0px auto;
  text-align: center;
  margin-top: 20px;
}
</style>
