<template>
  <v-ons-page>
    <tool-bar :option="{ menu: true, notification: true, back: true, redirectUrl: '/'}" />
    <div class="proposal-create-container">
      <h2 class="title-2">Propose development fund</h2>
      <div>
        <p class="label">Title of new feature</p>
        <input
          type="text"
          v-model="title"
          class="text-input"
          autocorrect="off"
          autocomplete="off"
          autocapitalize="off"
        />
      </div>

      <div>
        <p class="label">Description</p>
        <textarea
          name="description-input"
          class="description-input"
          v-model="description"
          cols="30"
          rows="5"
        ></textarea>
      </div>

      <div>
        <p class="label">Proposed Amount</p>
        <input
          type="text"
          v-model="amount"
          class="text-input"
          autocorrect="off"
          autocomplete="off"
          autocapitalize="off"
        />
      </div>
      <div>
        <p class="label">Payment Plan</p>
        <div class="drop-down-container">
          <v-ons-select style="width: 40%" v-model="selectedPaymentType">
            <option v-for="item in paymentType" :value="item.value" :key="item.id">{{ item.text }}</option>
          </v-ons-select>
          <v-ons-icon icon="ion-ios-arrow-down" size="lg" class="drop-down-icon"></v-ons-icon>
        </div>
      </div>

      <div v-if="selectedPaymentType === 'multiple'">
        <p class="label">Payment Count</p>
        <input
          type="text"
          placeholder="5"
          v-model="paymentCount"
          class="text-input"
          autocorrect="off"
          autocomplete="off"
          autocapitalize="off"
        />
      </div>

      <div v-if="selectedPaymentType === 'multiple'">
        <p class="label">Delay between payments (in minutes)</p>
        <input
          type="text"
          placeholder="0"
          v-model="delay"
          class="text-input"
          autocorrect="off"
          autocomplete="off"
          autocapitalize="off"
        />
      </div>

      <p class="coin-usage-warning" v-if="!allowProposal">
        Dev Proposal window is closed now. Next dev proposal window will start at
        <strong>{{ new Date(this.nextProposalWindow) }}</strong>
      </p>
      <p
        class="coin-usage-warning"
        v-else
      >Dev Proposal window is open until {{ new Date(currentProposalWindow[1])}}.</p>
      <Button text="Submit Proposal" :onClick="onSubmitProposal" :isDisabled="false" />
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
      selectedPaymentType: "single",
      amount: 10000,
      title: "",
      description: "",
      paymentType: [
        {
          id: 1,
          text: "Single",
          value: "single"
        },
        {
          id: 2,
          text: "Multiple",
          value: "multiple"
        }
      ],
      paymentCount: 1,
      delay: 0,
      allowProposal: false,
      nextProposalWindow: null,
      currentProposalWindow: null,
      proposalWindowChecker: null
    };
  },
  computed: {
    ...mapGetters({
      getWallet: "wallet/getWallet",
      getAppState: "chat/getAppState"
    })
  },
  mounted: async function() {
    this.proposalWindowChecker = setInterval(async () => {
      this.allowProposal = await this.isDevProposalWindowOpen();
    }, 3000);
  },
  beforeDestroy: function() {
    clearInterval(this.proposalWindowChecker);
  },
  methods: {
    async isDevProposalWindowOpen() {
      let networkParameters = await utils.queryParameters();
      let proposalWindow = networkParameters["DEV_WINDOWS"].devProposalWindow;
      let applyWindow = networkParameters["DEV_WINDOWS"].devApplyWindow;
      this.currentProposalWindow = proposalWindow;
      if (networkParameters["NEXT_DEV_WINDOWS"].devProposalWindow) {
        this.nextProposalWindow =
          networkParameters["NEXT_DEV_WINDOWS"].devProposalWindow[0];
      } else {
        this.nextProposalWindow = proposalWindow[1] + 1000 * 60 * 4;
      }
      console.log(new Date(proposalWindow[0]), new Date(proposalWindow[1]));
      let now = Date.now();
      if (now > proposalWindow[0] && now < proposalWindow[1]) {
        return true;
      }
      return false;
    },
    redirect(url) {
      this.$router.push(url);
    },
    async onSubmitProposal() {
      let myWallet = this.getWallet;
      let proposal = {
        description: this.description,
        totalAmount: parseFloat(this.amount),
        paymentCount: parseInt(this.paymentCount),
        delay: this.delay * 60 * 1000,
        paymentType: this.selectedPaymentType,
        title: this.title
      };
      let proposalTx = await utils.createDevProposal(myWallet, proposal);
      console.log(proposalTx);
      let isSubmitted = await utils.submitProposl(proposalTx);
      if (isSubmitted) {
        this.$ons.notification.alert("Dev Proposal is submitted.");
        this.amount = "";
        this.selectedPaymentType = "single";
        this.delay = 0;
        this.paymentCount = 1;
        this.title = "";
        this.description = "";
        this.redirect("/");
      }
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
  font-family: Poppins;
  font-size: 14px;
  color: #484848;
  letter-spacing: 0.17px;
  line-height: 20px;
}
.add-new-choice {
  font-family: Poppins;
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
  font-family: Poppins;
  font-size: 12px;
  color: #6a6a6a;
  letter-spacing: 0;
  line-height: 20px;
}
</style>


