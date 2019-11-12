<template>
  <v-ons-page>
    <tool-bar :option="{ menu: true, notification: true, back: false}" />
    <Title text="My Votes" />
    <div class="my-vote-list-container">
      <MyVoteListItem v-for="vote in votes" :key="vote.title" :vote="vote" />
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
export default {
  components: {
    MessageListItem,
    Title,
    ToolBar,
    Button,
    MyVoteListItem
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
  }
};
</script>

<style>
</style>
