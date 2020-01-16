<template>
  <div class="proposal-list-item">
    <!-- {{ proposal }} -->
    <div v-if="proposal.type === 'proposal'">
      <h4 class="proposal-title">
        {{ proposal.parameters.title }}
      </h4>
      <p class="proposal-description">
        <strong>Description</strong>: {{ proposal.parameters.description }}
      </p>
      <table id="network-table" v-if="proposal">
        <thead>
          <tr>
            <td>Parameter</td>
            <td>Proposed Values</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="parameter-name">Funding Proposal Fee</td>

            <td class="new-value">
              <span
                v-if="proposal.proposedParameters.devProposalFee"
                class="new-parameter"
                >{{ proposal.parameters.devProposalFee }}</span
              >
              <span v-else>{{ proposal.parameters.devProposalFee }}</span>
            </td>
          </tr>
          <tr>
            <td class="parameter-name">Min. Maintenance Fee</td>

            <td class="new-value">
              <span
                v-if="proposal.proposedParameters.maintenanceFee"
                class="new-parameter"
                >{{ proposal.parameters.maintenanceFee }}</span
              >
              <span v-else>{{ proposal.parameters.maintenanceFee }}</span>
            </td>
          </tr>
          <tr>
            <td class="parameter-name">Maintenance Interval</td>

            <td class="new-value">
              <span
                v-if="proposal.proposedParameters.maintenanceInterval"
                class="new-parameter"
                >{{ proposal.parameters.maintenanceInterval }}</span
              >
              <span v-else>{{ proposal.parameters.maintenanceInterval }}</span>
            </td>
          </tr>
          <tr>
            <td class="parameter-name">Node Penalty</td>

            <td class="new-value">
              <span
                v-if="proposal.proposedParameters.nodePenalty"
                class="new-parameter"
                >{{ proposal.parameters.nodePenalty }}</span
              >
              <span v-else>{{ proposal.parameters.nodePenalty }}</span>
            </td>
          </tr>
          <tr>
            <td class="parameter-name">Node Reward Amount</td>

            <td class="new-value">
              <span
                v-if="proposal.proposedParameters.nodeRewardAmount"
                class="new-parameter"
              >
                {{ proposal.parameters.nodeRewardAmount }}</span
              >
              <span v-else> {{ proposal.parameters.nodeRewardAmount }}</span>
            </td>
          </tr>
          <tr>
            <td class="parameter-name">Node Reward Interval</td>

            <td class="new-value">
              <span
                v-if="proposal.proposedParameters.nodeRewardInterval"
                class="new-parameter"
              >
                {{ proposal.parameters.nodeRewardInterval }}</span
              >
              <span v-else> {{ proposal.parameters.nodeRewardInterval }}</span>
            </td>
          </tr>
          <tr>
            <td class="parameter-name">Proposal Fee</td>

            <td class="new-value">
              <span
                v-if="proposal.proposedParameters.proposalFee"
                class="new-parameter"
              >
                {{ proposal.parameters.proposalFee }}</span
              >
              <span v-else> {{ proposal.parameters.proposalFee }}</span>
            </td>
          </tr>
          <tr>
            <td class="parameter-name">Stake Required</td>

            <td class="new-value">
              <span
                v-if="proposal.proposedParameters.stakeRequired"
                class="new-parameter"
              >
                {{ proposal.parameters.stakeRequired }}</span
              >
              <span v-else> {{ proposal.parameters.stakeRequired }}</span>
            </td>
          </tr>
          <tr>
            <td class="parameter-name">Transaction Fee</td>

            <td class="new-value">
              <span
                v-if="proposal.proposedParameters.transactionFee"
                class="new-parameter"
              >
                {{ proposal.parameters.transactionFee }}</span
              >
              <span v-else> {{ proposal.parameters.transactionFee }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="choice-list">
        <button
          :class="{
            'choice-button': true,
            approve: true,
            active: selectedChoice === true
          }"
          @click="onChooseVote(true)"
        >
          Approve
        </button>
        <button
          :class="{
            'choice-button': true,
            reject: true,
            active: selectedChoice === false
          }"
          @click="onChooseVote(false)"
        >
          No Change
        </button>
      </div>

      <input
        type="text"
        placeholder="Enter coin amount to vote"
        class="text-input"
        v-model="voteAmount"
        v-on:keyup="onEnterVote"
      />

      <!-- <p class="proposal-description">{{proposal.description}}</p> -->
      <div class="proposal-footer">
        <p>Total {{ proposal.totalVotes }} votes</p>
        <p>{{ timestamp }}</p>
      </div>
    </div>

    <div v-else-if="proposal.type === 'dev_proposal'">
      <h4 v-if="proposal.title" class="proposal-title">{{ proposal.title }}</h4>
      <p class="proposal-type">
        <strong>Description</strong>: {{ proposal.description }}
      </p>
      <p class="proposal-type">
        <strong>Amount</strong>: {{ proposal.totalAmount }} coins
      </p>
      <p class="proposal-type">
        <strong>Payment Type</strong>:
        {{ proposal.payments.length > 1 ? 'Multiple' : 'One time' }}
      </p>
      <section v-if="proposal.payments.length > 1">
        <p class="proposal-type"><strong>Payment Milestones</strong>:</p>
        <ul class="milestone-list">
          <li
            v-for="(milestone, i) in proposal.payments"
            :key="generateHash(milestone)"
          >
            <em>Milestone {{ i + 1 }}</em> : {{ milestone.amount }} coins after
            {{ milestone.delay / (1000 * 60) }} minutes
          </li>
        </ul>
      </section>
      <div class="choice-list" v-if="Object.hasOwnProperty('approved')">
        <button
          :class="{
            'choice-button': true,
            approve: true,
            active: selectedChoice === true
          }"
          @click="onChooseVote(true)"
        >
          Approve
        </button>
        <button
          :class="{
            'choice-button': true,
            reject: true,
            active: selectedChoice === false
          }"
          @click="onChooseVote(false)"
        >
          Reject
        </button>
      </div>

      <input
        type="text"
        placeholder="Enter coin amount to vote"
        class="text-input"
        v-model="voteAmount"
        v-on:keyup="onEnterVote"
        v-if="Object.hasOwnProperty('approved')"
      />

      <div class="proposal-footer">
        <div>
          <p>Vote Count</p>
          <p>{{ proposal.totalVotes }}</p>
        </div>
        <div>
          <p>Approve Votes</p>
          <p>{{ proposal.approve }} coins</p>
        </div>
        <div>
          <p>Rejecte Votes</p>
          <p>{{ proposal.reject }} coins</p>
        </div>
        <div>
          <p>Created on</p>
          <p>{{ timestamp }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import utils from '../assets/utils'
export default {
  props: ['proposal'],
  data: function () {
    return {
      voteAmount: '',
      selectedChoice: true
    }
  },
  computed: {
    timestamp () {
      return moment(this.proposal.timestamp).calendar()
    },
    proposalTitle () {
      let title = this.proposal.id.substr(0, 8).toUpperCase()
      return `ID: ${title}`
    }
  },
  async mounted () {
    // if(this.proposal) this.otherPersonHandle = await utils.getHandle(this.proposal.otherPersonAddress)
    console.log(this.proposal)
  },
  methods: {
    redirect (url) {
      this.$router.push(url)
    },
    onChooseVote (choice) {
      this.selectedChoice = choice
    },
    onEnterVote () {
      this.$emit('vote-enter', {
        amount: parseFloat(this.voteAmount),
        approve: this.selectedChoice,
        number: this.proposal.number
      })
    },
    generateHash (data) {
      return utils.hashVerificationCode(JSON.stringify(data)).slice(0, 8)
    }
  }
}
</script>

<style lang="scss">
.proposal-list-item {
  background: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(206, 206, 206, 0.5);
  border-radius: 12px;
  width: 100%;
  margin: 20px auto;
  padding: 20px;
  .choice-list {
    padding: 0px;
    margin: 20px 0px;
    width: 100%;
    display: flex;
    button {
      width: 50%;
      height: 50px;
      background: #e2e2e2;
      margin: 0px;
      color: #333;
      /* box-sizing: border-box; */
      border: none;
      outline: none;
      font-size: 14px;
      font-family: 'Poppins';
      cursor: pointer;
      transition: 0.3s;
    }
    .approve.active {
      background: #44db5e;
      color: #fff;
    }
    .reject.active {
      background: #f24243;
      color: #fff;
    }
  }
  .text-input {
    box-shadow: none;
    border: 2px solid #e1e1e1;
  }
  table {
    width: 100%;
    padding: 15px;
    border-radius: 0px;
    border: 1px solid #e8e8e8;
    margin: 20px auto;
    tr {
      height: 30px;
      td {
        text-align: right;
        input {
          padding: 10px;
          display: block;
          height: 30px;
          max-width: 80px;
          margin: 0 auto;
          border-radius: 5px;
          box-shadow: none;
          border: 1px solid #d5d5d5;
        }
        .new-parameter {
          color: #f83923;
          font-weight: bold;
        }
      }
      td:nth-of-type(1) {
        text-align: left;
      }
    }
    thead {
      tr {
        font-weight: bold;
      }
    }
  }
}
.proposal-list-item .proposal-title {
  font-family: Poppins;
  font-size: 18px;
  color: #0a2463;
  letter-spacing: 0;
  line-height: 20px;
}
.proposal-list-item .proposal-description {
  font-family: Poppins;
  font-size: 13px;
  color: #333;
  letter-spacing: 0;
  line-height: 20px;
  text-align: left;
}
.proposal-list-item .proposal-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  p {
    font-family: Poppins;
    font-size: 11px;
    text-align: left;
    color: #0a2463;
    letter-spacing: 0;
    line-height: 20px;
  }
  p:nth-of-type(1) {
    font-weight: bold;
  }
}
.milestone-list {
  font-size: 13px;
  padding-left: 15px;
  li {
    list-style: none;
  }
}
</style>
