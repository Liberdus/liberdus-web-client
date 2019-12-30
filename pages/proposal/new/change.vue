<template>
  <v-ons-page>
    <tool-bar :option="{ menu: false, notification: false, back: true, redirectUrl: '/'}" />
    <div class="proposal-create-container">
      <h2 class="title-2">Propose new network parameter</h2>
      <div v-if="!currentProposalWindow">Unable to get proposal window from server.</div>
      <div v-else>
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
          <textarea
            name="description-input"
            class="description-input"
            v-model="description"
            cols="30"
            rows="5"
          ></textarea>
        </div>

        <div>
          <p class="label">Enter proposed value</p>
          <input
            type="text"
            placeholder="Proposed value"
            v-model="newValue"
            class="text-input"
            autocorrect="off"
            autocomplete="off"
            autocapitalize="off"
          />
        </div>
        <p class="coin-usage-warning" v-if="!allowProposal">
          Proposal window is closed now. Next proposal window will start at
          <strong
            v-if="nextProposalStart"
          >{{ new Date(nextProposalStart) }}</strong>
        </p>
        <p
          class="coin-usage-warning"
          v-else
        >Proposal window is open until {{ new Date(currentProposalWindow[1])}}.</p>
        <Button text="Submit Proposal" :onClick="onSubmitProposal" :isDisabled="!allowProposal" />
      </div>
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
      selectedParameter: "transactionFee",
      allowProposal: false,
      parameters: [
        {
          id: 1,
          text: "Maintenance Fee",
          value: "maintenanceFee"
        },
        {
          id: 2,
          text: "Maintenance Interval",
          value: "maintenanceInterval"
        },
        {
          id: 3,
          text: "Node Reward Amount",
          value: "nodeRewardAmount"
        },
        {
          id: 4,
          text: "Node Reward Interval",
          value: "nodeRewardInterval"
        },
        {
          id: 5,
          text: "Transaction Fee",
          value: "transactionFee"
        },
        {
          id: 6,
          text: "Proposal Fee",
          value: "proposalFee"
        },
        {
          id: 7,
          text: "Stake Required",
          value: "stakeRequired"
        },
        {
          id: 8,
          text: "Node Penalty",
          value: "nodePenalty"
        }
      ],
      newValue: "",
      description: "",
      nextProposalStart: null,
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
      this.allowProposal = await this.isProposalWindowOpen();
    }, 3000);
  },
  beforeDestroy: function() {
    console.log("Clearing proposal window checker...");
    clearInterval(this.proposalWindowChecker);
  },
  methods: {
    async onSubmitProposal() {
      let myWallet = this.getWallet;
      let proposal = {
        parameters: {}
      };
      proposal.parameters[this.selectedParameter] = parseInt(this.newValue);
      proposal.description = this.description;
      let proposalTx = await utils.createProposal(
        myWallet,
        this.selectedParameter,
        parseFloat(this.newValue)
      );
      console.log(proposalTx);
      let isSubmitted = await utils.submitProposl(proposalTx);
      console.log("isSubmitted", isSubmitted);
      if (isSubmitted) {
        this.$ons.notification.alert("Your proposal is submitted.");
        this.newValue = "";
        this.redirect("/");
      } else {
        this.$ons.notification.alert("Failed to submit proposal");
      }
    },
    redirect(url) {
      this.$router.push(url);
    },
    async isProposalWindowOpen() {
      try {
        let networkParameters = await utils.queryParameters();
        let proposalWindow = networkParameters["WINDOWS"].proposalWindow;
        let applyWindow = networkParameters["WINDOWS"].applyWindow;
        this.currentProposalWindow = proposalWindow;
        console.log(new Date(proposalWindow[0]), new Date(proposalWindow[1]));
        if (networkParameters["NEXT_WINDOWS"].proposalWindow) {
          this.nextProposalStart =
            networkParameters["NEXT_WINDOWS"].proposalWindow[0];
        } else {
          this.nextProposalStart = proposalWindow[1] + 1000 * 60 * 4;
        }

        let now = Date.now();
        if (proposalWindow[0] > now) this.nextProposalStart = proposalWindow[0];
        if (now > proposalWindow[0] && now < proposalWindow[1]) {
          return true;
        }
        return false;
      } catch (e) {
        console.warn(e);
        return false;
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

