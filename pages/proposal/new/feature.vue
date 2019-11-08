<template>
  <v-ons-page>
    <tool-bar :option="{ menu: true, notification: true, back: true, redirectUrl: '/'}" />
    <div class="proposal-create-container">
      <h2 class="title-2">Propose new feature</h2>
      <div>
        <p class="label">Title of new feature</p>
        <input
          type="text"
          placeholder=""
          class="text-input"
          autocorrect="off"
          autocomplete="off"
          autocapitalize="off"
        />
      </div>

      <div>
        <p class="label">Description</p>
        <textarea name="description-input" class="description-input" cols="30" rows="5"></textarea>
      </div>

      <div>
        <p class="label">Funding Type</p>
        <div class="drop-down-container">
          <v-ons-select style="width: 40%" v-model="selectedFundingType">
            <option v-for="item in fundingTypes" :value="item.value" :key="item.id">{{ item.text }}</option>
          </v-ons-select>
          <v-ons-icon icon="ion-ios-arrow-down" size="lg" class="drop-down-icon"></v-ons-icon>
        </div>
      </div>

      <p class="coin-usage-warning">You will spend 10 coins to create this proposal</p>
      <Button text="Submit Proposal" :onClick="onSubmitProposal" />
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
      selectedFundingType: "Lump Sum",
      fundingTypes: [
        {
          id: 1,
          text: "Lump Sum",
          value: "Lump Sum"
        },
        {
          id: 2,
          text: "Milestone",
          value: "Milestone"
        }
      ]
    };
  },
  methods: {
    onSubmitProposal() {
      this.$router.push("/proposal/confirm/123");
    }
  }
};
</script>
<style scoped>


</style>

