<template>
  <v-ons-page>
    <tool-bar :option="{ menu: true, notification: true, back: true, redirectUrl: '/'}" />
    <div class="proposal-create-container">
      <h2 class="title-2">Propose a change</h2>
      <div>
        <p class="label">Select a parameter to change</p>
        <div class="drop-down-container">
          <v-ons-select style="width: 40%" v-model="selectedParameter">
            <option v-for="item in parameters" :value="item.value" :key="item.id">{{ item.text }}</option>
          </v-ons-select>
          <v-ons-icon icon="ion-ios-arrow-down" size="lg" class="drop-down-icon"></v-ons-icon>
        </div>
      </div>

      <div>
        <p class="label">Description</p>
        <textarea name="description-input" class="description-input" cols="30" rows="5"></textarea>
      </div>

      <div>
        <p class="label">Enter new value for choice A</p>
        <input
          type="text"
          placeholder="Choice A"
          class="text-input"
          autocorrect="off"
          autocomplete="off"
          autocapitalize="off"
        />
      </div>

      <div>
        <p class="label">Enter new value for choice B</p>
        <input
          type="text"
          placeholder="Choice B"
          class="text-input"
          autocorrect="off"
          autocomplete="off"
          autocapitalize="off"
        />
      </div>

      <button class="add-new-choice">
        <v-ons-icon icon="ion-ios-add" size="lg"></v-ons-icon>Add New Choice
      </button>

      <p class="coin-usage-warning">You will spend 5 coins to create this proposal</p>
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
      selectedParameter: "Daily account maintenance fee",
      parameters: [
        {
          id: 1,
          text: "Daily account maintenance fee",
          value: "Daily account maintenance fee"
        },
        {
          id: 2,
          text: "Transaction Fee",
          value: "Transaction Fee"
        },
        {
          id: 3,
          text: "Daily reward",
          value: "Daily reward"
        }
      ]
    };
  },
  methods: {
    onSubmitProposal() {
      // this.$router.push("/proposal/confirm/123");
      // alert('')
    }
  }
};
</script>
<style>
.proposal-create-container {
  width: 90%;
  max-width: 600px;
  margin: 20px auto;
}
.proposal-create-container p {
  text-align: left;
}
.proposal-create-container > div {
  margin: 10px auto;
  width: 100%;
}
.drop-down-icon {
  color: #0a2463;
  position: relative;
  top: -30px;
  float: right;
  left: -20px;
}
.description-input {
  background: #ffffff;
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.08), 0 4px 8px 0 rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  border: none;
  width: 100%;
  max-width: 600px;
  padding: 20px;
  font-family: Poppins-Regular;
  font-size: 14px;
  color: #484848;
  letter-spacing: 0.17px;
  line-height: 20px;
}
.add-new-choice {
  font-family: Poppins-Regular;
  font-size: 14px;
  color: #0a2463;
  letter-spacing: 0;
  line-height: 20px;
  text-align: center;
  background: transparent;
  border: none;
  width: 300px;
  margin: 30px auto;
  display: block;
  cursor: pointer;
  outline: none;
}
.add-new-choice .ons-icon.ion-ios-add {
  font-size: 20px;
  margin-right: 15px;
  width: 20px;
  height: 20px;
  border-radius: 20px;
  background: #fff;
  background: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(206, 206, 206, 0.5);
}
.coin-usage-warning {
  font-family: Poppins-Regular;
  font-size: 12px;
  color: #6a6a6a;
  letter-spacing: 0;
  line-height: 20px;
}
</style>

