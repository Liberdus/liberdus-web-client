<template>
  <!-- <v-ons-page> -->
  <div>
    <!-- <tool-bar :option="{ menu: false, notification: false, back: true, backUrl: '/proposal/123'}" /> -->
    <div class="proposal-detail-container">
      <h2 class="proposal-title">
        Daily coins paid to node runners
      </h2>
      <div class="proposal-info-detail">
        <div class="row-1">
          <div>
            <p class="label">
              Proposal ID
            </p>
            <p class="value">
              0xab…c95b
            </p>
          </div>
        </div>
        <div class="row-2">
          <div>
            <p class="label">
              Proposal Title
            </p>
            <p class="value">
              Daily coins paid to node runners
            </p>
          </div>
        </div>
        <div class="row-3">
          <div>
            <p class="label">
              Coin Required
            </p>
            <p class="value">
              10
            </p>
          </div>
        </div>
        <div>
          <p class="label">
            Selected value to vote
          </p>
          <div class="choice-list-container">
            <Choice
              tag="A"
              value="20"
            />
          </div>
        </div>
      </div>

      <Button
        text="Confirm"
        :on-click="onConfirmVote"
      />
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
import { mapGetters, mapActions } from "vuex";
import utils from "../../../assets/utils";
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
  layout: 'dashboard',
  data: function() {
    return {
      voteState: "select"
    };
  },
  methods: {
    onConfirmVote() {
      console.log("Vote is confirmed");
      this.$router.push("/proposal/success/123");
    }
  }
};
</script>

<style>
</style>
