<template>
  <v-ons-page>
    <!-- <tool-bar :option="{ menu: true, notification: true, back: false}" /> -->
    <Title text="Active Proposals" />
    <!-- {{ getActiveDevProposals }}
    {{ getCompletedDevProposals }}
    {{ allActiveProposalList }}-->
    <div class="proposal-list-container">
      <ProposalListItem
        v-for="proposal in allActiveProposalList"
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
import ProposalListItem from "~/components/ProposalListItem";
import Title from "~/components/baisc/Title";
import Button from "~/components/baisc/Button";
export default {
  components: {
    MessageListItem,
    Title,
    ToolBar,
    Button,
    ProposalListItem
  },
  data: function() {
    return {
      proposalList: [],
      propsalListSubscription: null
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
    shouldRender() {
      let should = this.isUIReady;
      return should;
    },
    allActiveProposalList() {
      let list = [];
      this.getActiveProposals.forEach(p => {
        let obj = { ...p };
        list.push(obj);
      });
      this.getActiveDevProposals.forEach(p => {
        let obj = { ...p };
        list.push(obj);
      });
      // list = list.sort((a, b) => b.timestamp - a.timestamp);
      return list;
    }
  },
  methods: {
    ...mapActions({
      updateAppState: "chat/updateAppState",
      updateLastMessage: "chat/updateLastMessage",
      updateLastTx: "chat/updateLastTx",
      updateActiveProposals: "proposal/updateActiveProposals",
      updateCompletedProposals: "proposal/updateCompletedProposals",
      updateActiveDevProposals: "proposal/updateActiveDevProposals",
      updateCompletedDevProposals: "proposal/updateCompletedDevProposals"
    }),
    redirect(url) {
      this.$router.push(url);
    },
    async refreshProposalList() {
      let allProposals = await utils.queryProposals();
      let currentParameters = await utils.queryParameters();
      allProposals = allProposals
        .map(proposal => {
          let proposedParameters = utils.getDifferentParameter(
            proposal,
            currentParameters
          );
          let obj = { ...proposal };
          obj.proposedParameters = proposedParameters;
          obj.type = "proposal";
          return obj;
        })
        .filter(proposal => {
          if (
            proposal.proposedParameters &&
            Object.keys(proposal.proposedParameters).length > 0
          )
            return true;
          else return false;
        });

      let activeProposalList = allProposals.filter(
        proposal => proposal.winner !== true && proposal.winner !== false
      );
      let completedProposalList = allProposals.filter(
        proposal => proposal.winner === true || proposal.winner === false
      );
      this.updateActiveProposals(activeProposalList);
      this.updateCompletedProposals(completedProposalList);
    },
    async refreshDevProposalList() {
      let allDevProposals = await utils.queryDevProposals();
      if (!allDevProposals) return;
      allDevProposals = allDevProposals.map(proposal => {
        let obj = { ...proposal };
        obj.type = "dev_proposal";
        return obj;
      });
      let activeDevProposalList = allDevProposals.filter(
        proposal => proposal.approved !== true && proposal.approved !== false
      );
      let completedDevProposalList = allDevProposals.filter(
        proposal => proposal.approved === true || proposal.approved === false
      );
      this.updateActiveDevProposals(activeDevProposalList);
      this.updateCompletedDevProposals(completedDevProposalList);
    },
    subscribeProposalList() {
      let self = this;
      this.propsalListSubscription = setInterval(() => {
        if (self.isUIReady) {
          console.log("Refreshing proposal and dev proposal list");
          self.refreshProposalList();
          self.refreshDevProposalList();
        }
      }, 10000);
    },
    unsubscribeProposalList() {
      let self = this;
      clearInterval(this.propsalListSubscription);
      this.propsalListSubscription = null;
    }
  },
  mounted: function() {
    this.subscribeProposalList();
  },
  beforeDestroy: function() {
    this.unsubscribeProposalList();
  }
};
</script>

<style>
.nuxt-link {
  width: 100%;
}
.new-message-btn {
  margin: 20px auto;
  width: 100%;
  text-align: center;
  font-size: 13px;
}
.message-list {
  max-width: 600px;
  margin: 20px auto;
}
.proposal-list-container {
  width: 90%;
  max-width: 600px;
  margin: 0 auto;
}
</style>
