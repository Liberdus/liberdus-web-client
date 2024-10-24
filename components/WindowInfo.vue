<template>
  <div
    v-if="derivedWindow"
    class="window-info-container"
  >
    <div class="switch-container">
      <!-- <v-ons-switch
        v-model="showAllWindow"
        input-id="switch1"
      /> -->
      <a-switch v-model="showAllWindow">
        <a-icon slot="checkedChildren" type="check" />
        <a-icon slot="unCheckedChildren" type="close" />
      </a-switch>
      <span class="body">Show all windows</span>
    </div>
    <!-- {{ derivedWindow }} -->
    <a-card
      v-if="currentWindowName === 'PROPOSAL' || showAllWindow"
      :class="{
        active: currentWindowName === 'PROPOSAL',
        'green-bg': currentWindowName === 'PROPOSAL' && showAllWindow
      }"
      size="small"
      title="Proposal Window"
    >
<!--      <label-->
<!--        v-if="currentWindowName === 'PROPOSAL'"-->
<!--        class="current-window-label"-->
<!--      >Current Active Window</label>-->
      <!-- <h5>Proposal Window</h5> -->
      <div
        v-if="currentWindowName === 'PROPOSAL'"
        class="timers"
      >
        <p class="coin-usage-warning">
          Proposal window will expire in
          <strong>{{ remainingSecondProposalWindow }}</strong>
        </p>
      </div>

      <a-row>
        <a-col :span="6">
          Start
        </a-col>

        <a-col :sapn="18" style="text-align: right">
          {{ formatDate(derivedWindow.proposalWindow[0]) }}
        </a-col>

        <a-col :span="6">
          End
        </a-col>

        <a-col :sapn="18" style="text-align: right">
          {{ formatDate(derivedWindow.proposalWindow[1]) }}
        </a-col>
      </a-row>
    </a-card>

    <a-card
      v-if="currentWindowName === 'VOTING' || showAllWindow"
      :class="{
        active: currentWindowName === 'VOTING',
        'green-bg': currentWindowName === 'VOTING' && showAllWindow
      }"
      size="small"
      title="Voting Window"
    >
<!--      <label-->
<!--        v-if="currentWindowName === 'VOTING'"-->
<!--        class="current-window-label"-->
<!--      >Current Active Window</label>-->
      <div
        v-if="currentWindowName === 'VOTING'"
        class="timers"
      >
        <p class="coin-usage-warning">
          Voting window will expire in
          <strong>{{ remainingSecondVotingWindow }}</strong>
        </p>
      </div>

      <a-row>
        <a-col :span="6">
          Start
        </a-col>

        <a-col :sapn="18" style="text-align: right">
          {{ formatDate(derivedWindow.votingWindow[0]) }}
        </a-col>

        <a-col :span="6">
          End
        </a-col>

        <a-col :sapn="18" style="text-align: right">
          {{ formatDate(derivedWindow.votingWindow[1]) }}
        </a-col>
      </a-row>
    </a-card>

    <a-card
      v-if="currentWindowName === 'GRACE' || showAllWindow"
      :class="{
        'green-bg': currentWindowName === 'GRACE' && showAllWindow
      }"
      size="small"
      title="Grace Window"
    >
<!--      <label-->
<!--        v-if="currentWindowName === 'GRACE'"-->
<!--        class="current-window-label"-->
<!--      >Current Active Window</label>-->
      <div
        v-if="currentWindowName === 'GRACE'"
        class="timers"
      >
        <p class="coin-usage-warning">
          Grace window will expire in
          <strong>{{ remainingSecondGraceWindow }}</strong>
        </p>
      </div>

      <a-row>
        <a-col :span="6">
          Start
        </a-col>

        <a-col :sapn="18" style="text-align: right">
          {{ formatDate(derivedWindow.graceWindow[0]) }}
        </a-col>

        <a-col :span="6">
          End
        </a-col>

        <a-col :sapn="18" style="text-align: right">
          {{ formatDate(derivedWindow.graceWindow[1]) }}
        </a-col>
      </a-row>
    </a-card>

    <a-card
      v-if="currentWindowName === 'APPLY' || showAllWindow"
      :class="{
        active: currentWindowName === 'APPLY',
        'green-bg': currentWindowName === 'APPLY' && showAllWindow
      }"
      size="small"
      title="Apply Window"
    >
<!--      <label-->
<!--        v-if="currentWindowName === 'APPLY'"-->
<!--        class="current-window-label"-->
<!--      >Current Active Window</label>-->
      <div
        v-if="currentWindowName === 'APPLY'"
        class="timers"
      >
        <p class="coin-usage-warning">
          Apply window will expire in
          <strong>{{ remainingSecondApplyWindow }}</strong>
        </p>
      </div>

      <a-row>
        <a-col :span="6">
          Start
        </a-col>

        <a-col :sapn="18" style="text-align: right">
          {{ formatDate(derivedWindow.applyWindow[0]) }}
        </a-col>

        <a-col :span="6">
          End
        </a-col>

        <a-col :sapn="18" style="text-align: right">
          {{ formatDate(derivedWindow.applyWindow[1]) }}
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>
<script>
import moment from 'moment'
export default {
  props: {
    window: {
      type: Object,
      required: true
    },
    currentWindowName: {
      type: String
    }
  },
  data: function () {
    return {
      showAllWindow: false,
      moment
    }
  },
  computed: {
    derivedWindow () {
      if (this.window.proposalWindow) {
        return Object.assign({}, this.window)
      } else if (this.window.devProposalWindow) {
        return {
          proposalWindow: this.window.devProposalWindow,
          votingWindow: this.window.devVotingWindow,
          graceWindow: this.window.devGraceWindow,
          applyWindow: this.window.devApplyWindow
        }
      }
    },
    remainingSecondProposalWindow () {
      let seconds = this.derivedWindow.proposalWindow[1] - Date.now()
      return this.secondsToDhms(seconds)
    },
    remainingSecondVotingWindow () {
      let seconds = this.derivedWindow.votingWindow[1] - Date.now()
      return this.secondsToDhms(seconds)
    },
    remainingSecondGraceWindow () {
      let seconds = this.derivedWindow.graceWindow[1] - Date.now()
      return this.secondsToDhms(seconds)
    },
    remainingSecondApplyWindow () {
      let seconds = this.derivedWindow.applyWindow[1] - Date.now()
      return this.secondsToDhms(seconds)
    }
  },
  methods: {
    formatDate (ts) {
      return moment(ts)
    },
    secondsToDhms (milisecond) {
      let seconds = Number(milisecond) / 1000
      let d = Math.floor(seconds / (3600 * 24))
      let h = Math.floor((seconds % (3600 * 24)) / 3600)
      let m = Math.floor((seconds % 3600) / 60)
      let s = Math.floor(seconds % 60)

      let dDisplay = d > 0 ? d + (d == 1 ? ' day, ' : ' days, ') : ''
      let hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : ''
      let mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : ''
      let sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : ''
      return dDisplay + hDisplay + mDisplay + sDisplay
    }
  }
}
</script>
<style lang="scss">
.switch__toggle {
  width: 40px;
  height: 20px;
}
.switch__handle {
  border-radius: 28px;
  height: 15px;
  width: 18px;
}

.window-info-container {
  .switch-container {
    margin: 15px auto;
    .body {
      font-size: 13px;
      color: #333;
    }
  }
  .ant-card {
    margin-bottom: 20px;
  }
  .window-info {
    margin: 10px auto;
    box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.08), 0 4px 8px 0 rgba(0, 0, 0, 0.08);
    border-radius: 10px;
    padding: 10px;
    border-radius: 5px;
    background: #f8f8f8;
    transition: 0.6s;
    .current-window-label {
      font-size: 11px;
      color: #44db5e;
      font-weight: bold;
    }
    div {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      margin-bottom: 5px;
    }
    h5 {
      font-size: 14px;
      font-family: 'Poppins';
      font-weight: bold;
      color: #132c68;
    }
    .timers {
      text-align: left;
      display: block;
    }
  }
  .green-bg {
    background: #44db5e;
    color: #fff;
    h5,
    p {
      color: #fff;
    }
    .current-window-label {
      color: #fff;
    }
  }
}
</style>
