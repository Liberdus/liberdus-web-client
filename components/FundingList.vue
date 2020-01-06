<template>
  <v-ons-page>
    <button class="white-button new-funding-button" @click="$router.push('/proposal/new/funding')">
      <v-ons-icon icon="ion-ios-wallet" size="lg"></v-ons-icon>New Funding Proposal
    </button>
    <div class="proposal-list-container">
      <ProposalListItem
        v-for="proposal in allCompletedProposalList"
        :key="proposal.id"
        :proposal="proposal"
        @click="redirect('/proposal/${proposal.id}')"
      />
    </div>
  </v-ons-page>
</template>

<script>
import MessageListItem from "~/components/MessageListItem";
import { mapGetters, mapActions } from "vuex";
import { concat } from "lodash";
import utils from "../assets/utils";
import newMessageSoundFile from "../assets/new_message_sound.mp3";
import ToolBar from "~/components/ToolBar";
import FundingItem from "~/components/FundingItem";
import Title from "~/components/baisc/Title";
import Button from "~/components/baisc/Button";
import ProposalListItem from "~/components/ProposalListItem";

export default {
  components: {
    MessageListItem,
    Title,
    ToolBar,
    Button,
    FundingItem,
    ProposalListItem
  },
  data: function() {
    return {};
  },
  computed: {
    ...mapGetters({
      getWallet: "wallet/getWallet",
      getAppState: "chat/getAppState",
      getLastMessage: "chat/getLastMessage",
      getLastTx: "chat/getLastTx",
      isUIReady: "chat/isUIReady",
      getActiveProposals: "proposal/getActiveProposals",
      getCompletedProposals: "proposal/getCompletedProposals",
      getActiveDevProposals: "proposal/getActiveDevProposals",
      getCompletedDevProposals: "proposal/getCompletedDevProposals"
    }),
    allCompletedProposalList() {
      const combinedDevProposals = concat(
        this.getActiveDevProposals,
        this.getCompletedDevProposals
      );
      return utils.sortByTimestamp(combinedDevProposals, "desc");
    }
  }
};
</script>

<style scoped lang="scss">
.my-vote-list-container {
  width: 90%;
  max-width: 600px;
  margin: 20px auto;
}
.new-funding-button {
  width: auto;
  padding: 0px 20px;
  display: block;
  position: relative;
  margin: 20px auto;
  // font-size: 13px;
}
</style>
