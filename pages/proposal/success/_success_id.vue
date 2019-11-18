<template>
  <v-ons-page>
    <tool-bar :option="{ menu: true, notification: true, back: true, redirectUrl: '/'}" />
    <div class="proposal-detail-container">
      <h2 class="title-2">Your Vote is submitted !</h2>
      <p class="value">Thanks for voting for this proposal</p>

      <ButtonOutline text="Back To Proposals" :onClick="onBackToHome" />
    </div>
  </v-ons-page>
</template>

<script>
import Vue from "vue";
import "onsenui/css/onsenui.css";
import "onsenui/css/onsen-css-components.css";
import VueOnsen from "vue-onsenui/esm";
import OnsenComponents from "~/components/Onsen";
import ChatText from "~/components/ChatText";
import ChatInput from "~/components/ChatInput";
import { mapGetters, mapActions } from "vuex";
import utils from "../../../assets/utils";
import ToolBar from "~/components/ToolBar";
import ProposalListItem from "~/components/ProposalListItem";
import Choice from "~/components/Choice";
import Title from "~/components/baisc/Title";
import Button from "~/components/baisc/Button";
import ButtonOutline from "~/components/baisc/ButtonOutline";

Vue.use(VueOnsen);
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c));

export default {
  components: {
    ToolBar,
    ButtonOutline,
    Title,
    Choice
  },
  data: function() {
    return {
      voteState: "select"
    };
  },
  computed: {
    id: () => {
      return this.$route.params.id;
    }
  },
  methods: {
    onBackToHome() {
      this.$router.push("/");
    }
  }
};
</script>

<style>
.proposal-detail-container {
  padding: 20px;
}

.proposal-detail-container .proposal-info-detail .row-1,
.proposal-detail-container .proposal-info-detail .row-2,
.proposal-detail-container .proposal-info-detail .row-3,
.proposal-detail-container .proposal-info-detail .row-4 {
  display: flex;
  justify-content: space-between;
}
.proposal-detail-container .proposal-info-detail .label {
  font-family: Poppins;
  font-size: 11px;
  color: #9d9d9d;
  letter-spacing: 0;
  line-height: 20px;
}
.proposal-detail-container .proposal-info-detail .value {
  font-family: Poppins;
  font-size: 12px;
  color: #0a2463;
  letter-spacing: 0;
  line-height: 20px;
}
.proposal-detail-container .proposal-description {
  font-family: Poppins;
  font-size: 14px;
  color: #6a6a6a;
  letter-spacing: 0;
  line-height: 20px;
  margin: 10px auto;
}
.proposal-detail-container .sub-head {
  font-family: Poppins;
  font-size: 15px;
  color: #0a2463;
  letter-spacing: 0;
}
.proposal-detail-container .hr {
  margin: 20px auto;
  width: 100%;
  height: 1px;
  background: #d8d8d8;
}
</style>
