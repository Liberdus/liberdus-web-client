<template>
  <div class="vote-list-item">
    <h4 class="vote-title">
      {{ vote.title }}
    </h4>
    <div class="my-vote-detail">
      <p class="label">
        You Voted:
      </p>
      <div class="selected-vote">
        <p class="tag">
          {{ vote.selectedVote.tag }}
        </p>
        <p>{{ vote.selectedVote.value }}</p>
      </div>
    </div>
    <div>
      <div v-for="tag of Object.keys(vote.votePercents)" :key="tag" class="vote-progress-container">
        <p>{{ tag }}. {{ vote.votePercents[tag] }}</p>
        <v-ons-progress-bar :value="vote.votePercents[tag]" />
      </div>
    </div>
    <div class="vote-footer">
      <p>{{ vote.voteCount }} Total Votes</p>
      <p>{{ timestamp }}</p>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import utils from '../assets/utils';
export default {
  props: ['vote'],
  computed: {
    timestamp() {
      return moment(this.vote.timestamp).calendar();
    },
  },
  async mounted() {
    // if(this.vote) this.otherPersonHandle = await utils.getHandle(this.vote.otherPersonAddress)
  },
  methods: {
    redirect(url) {
      console.log('redirect');
      this.$router.push(url);
    },
  },
};
</script>

<style>
.vote-list-item {
  background: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(206, 206, 206, 0.5);
  border-radius: 12px;
  width: 90%;
  margin: 20px auto;
  padding: 20px;
  cursor: pointer;
}
.vote-list-item .vote-title {
  font-family: Poppins;
  font-size: 14px;
  color: #0a2463;
  letter-spacing: 0;
  line-height: 20px;
}
.vote-list-item .vote-description {
  font-family: Poppins;
  font-size: 14px;
  color: #6a6a6a;
  letter-spacing: 0;
  line-height: 20px;
  text-align: left;
}
.vote-list-item .vote-footer > p {
  font-family: Poppins;
  font-size: 14px;
  color: #0a2463;
  letter-spacing: 0;
  line-height: 20px;
}
.vote-list-item .vote-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
.vote-list-item .vote-progress-container {
  margin: 10px auto;
}
.vote-list-item .tag {
  width: 23px;
  height: 23px;
  border-radius: 20px;
  border: none;
  background: #2648d8;
  font-family: Poppins;
  font-weight: 700;
  font-size: 12px;
  color: #ffffff;
  letter-spacing: 0.47px;
  text-align: center;
  padding-top: 2px;
}
.vote-list-item .my-vote-detail {
  display: flex;
  justify-content: space-between;
}
.vote-list-item .my-vote-detail .selected-vote {
  display: flex;
  justify-content: space-between;
  width: 50px;
  align-items: center;
}
</style>
