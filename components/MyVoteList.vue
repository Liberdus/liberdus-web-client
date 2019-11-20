<template>
  <v-ons-page>
    <tool-bar :option="{ menu: true, notification: true, back: false}" />
    <Title text="Completed Proposal" />
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
import utils from "../assets/utils";
import * as R from "ramda";
import newMessageSoundFile from "../assets/new_message_sound.mp3";
import ToolBar from "~/components/ToolBar";
import MyVoteListItem from "~/components/MyVoteListItem";
import Title from "~/components/baisc/Title";
import Button from "~/components/baisc/Button";
import ProposalListItem from "~/components/ProposalListItem";

export default {
  components: {
    MessageListItem,
    Title,
    ToolBar,
    Button,
    MyVoteListItem,
    ProposalListItem
  },
  data: function() {
    return {
      votes: [
        {
          title: "Daily coins paid to node runners",
          selectedVote: {
            tag: "A",
            value: 20
          },
          votePercents: {
            A: 20,
            B: 50,
            C: 32
          },
          voteCount: 1200,
          closeTimestamp: Date.now() + 1000 * 60 * 24
        },
        {
          title: "Remove Staking Requirement",
          selectedVote: {
            tag: "B",
            value: "No"
          },
          votePercents: {
            A: 34,
            B: 66
          },
          voteCount: 324,
          closeTimestamp: Date.now() + 1000 * 60 * 24 * 3
        }
      ]
    };
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
      let list = [];
      if (this.getCompletedDevProposals.length > 0) this.getCompletedDevProposals.forEach(p => {
        let obj = {...p}
        list.push(obj)
      });
      if (this.getCompletedProposals.length > 0) this.getCompletedProposals.forEach(p => {
        let obj = {...p}
        list.push(obj)
      });
      list = list.sort((a, b) => b.timestamp - a.timestamp);
      return list;
    }
  }
};
</script>

<style>
.my-vote-list-container {
  width: 90%;
  max-width: 600px;
  margin: 20px auto;
}
</style>
