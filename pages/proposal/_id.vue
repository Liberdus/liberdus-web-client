<template>
  <v-ons-page>
    <tool-bar :option="{ menu: true, notification: true, back: true, redirectUrl: '/'}" />
    <div class="proposal-detail-container">
      <h2 class="proposal-title">Daily coins paid to node runners</h2>
      <div class="proposal-info-detail">
        <div class="row-1">
          <div>
            <p class="label">Proposer</p>
            <p class="value">0xab…c95b</p>
          </div>
          <div>
            <p class="label">Created on</p>
            <p class="value">09 Oct 2019</p>
          </div>
        </div>
        <div class="row-2">
          <div>
            <p class="label">Required coins to vote</p>
            <p class="value">10</p>
          </div>
          <div>
            <p class="label">Ending on</p>
            <p class="value">29 Oct 2019</p>
          </div>
        </div>
      </div>

      <p
        class="proposal-description"
      >Velit quae inventore est sed. Possimus non ex accusamus sit hic consequatur ut voluptatum. In explicabo id magnam et aperiam quos</p>
      <p class="sub-head">
        Current Value:
        <strong>5</strong>
      </p>
      <div class="hr"></div>
      <p class="sub-head">Proposed Values</p>
      <p class="proposal-description">Please select one of 3 proposed new values to vote</p>

      <Choice tag="A" value="20" />
      <Choice tag="B" value="50" />
      <Choice tag="C" value="100" />

      <Button text="Next" :onClick="goToConfirmVote" />
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
import utils from "../../assets/utils";
import sentSoundFile from "../../assets/sent_sound.mp3";
import ToolBar from "~/components/ToolBar";
import ProposalListItem from "~/components/ProposalListItem";
import Choice from "~/components/Choice";
import Title from "~/components/baisc/Title";
import Button from "~/components/baisc/Button";

Vue.use(VueOnsen);
Object.values(OnsenComponents).forEach(c => Vue.component(c.name, c));

export default {
  components: {
    ToolBar,
    Button,
    Title,
    Choice
  },
  data: function() {
    return {
      text: ""
    };
  },
  methods: {
    goToConfirmVote() {
      this.$router.push("/proposal/confirm/123");
    }
  }
};
</script>

<style>
.proposal-detail-container {
  padding: 20px;
  width: 90%;
  max-width: 600px;
  margin: 0 auto;
}
.proposal-detail-container p {
  text-align: left;
}
.proposal-detail-container .proposal-title {
  font-family: Poppins-Medium;
  font-size: 22px;
  color: #0a2463;
  letter-spacing: 0;
}
.proposal-detail-container .proposal-info-detail .row-1,
.proposal-detail-container .proposal-info-detail .row-2,
.proposal-detail-container .proposal-info-detail .row-3,
.proposal-detail-container .proposal-info-detail .row-4 {
  display: flex;
  justify-content: space-between;
}
.proposal-detail-container .proposal-info-detail .label {
  font-family: Poppins-Regular;
  font-size: 11px;
  color: #9d9d9d;
  letter-spacing: 0;
  line-height: 20px;
}
.proposal-detail-container .proposal-info-detail .value {
  font-family: Poppins-Regular;
  font-size: 12px;
  color: #0a2463;
  letter-spacing: 0;
  line-height: 20px;
}
.proposal-detail-container .proposal-description {
  font-family: Poppins-Regular;
  font-size: 14px;
  color: #6a6a6a;
  letter-spacing: 0;
  line-height: 20px;
  margin: 10px auto;
}
.proposal-detail-container .sub-head {
  font-family: Poppins-Regular;
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
