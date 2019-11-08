<template>
  <div class="proposal-list-item" @click="redirect('/proposal/123')">
    <h4 class="proposal-title">{{proposal.title}}</h4>
    <p class="proposal-description">{{proposal.description}}</p>
    <div class="proposal-footer">
      <p>Total {{ proposal.voteCount }} votes</p>
      <p>{{ timestamp }}</p>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import utils from "../assets/utils";
export default {
  props: ["proposal"],
  computed: {
    timestamp() {
      return moment(this.proposal.timestamp).calendar();
    }
  },
  async mounted() {
    // if(this.proposal) this.otherPersonHandle = await utils.getHandle(this.proposal.otherPersonAddress)
  },
  methods: {
    redirect(url) {
      console.log("redirect");
      this.$router.push(url);
    }
  }
};
</script>

<style>
.proposal-list-item {
  background: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(206, 206, 206, 0.5);
  border-radius: 12px;
  width: 90%;
  margin: 20px auto;
  padding: 20px;
}
.proposal-list-item .proposal-title {
  font-family: Poppins;
  font-size: 14px;
  color: #0a2463;
  letter-spacing: 0;
  line-height: 20px;
}
.proposal-list-item .proposal-description {
  font-family: Poppins;
  font-size: 14px;
  color: #6a6a6a;
  letter-spacing: 0;
  line-height: 20px;
  text-align: left;
}
.proposal-list-item .proposal-footer > p {
  font-family: Poppins;
  font-size: 14px;
  color: #0a2463;
  letter-spacing: 0;
  line-height: 20px;
}
.proposal-list-item .proposal-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
</style>
