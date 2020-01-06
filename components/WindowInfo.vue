<template>
  <div class="window-info-container" v-if="derivedWindow">
    <div class="switch-container">
      <v-ons-switch input-id="switch1" v-model="showAllWindow"></v-ons-switch>
      <span class="body">Show all windows</span>
    </div>
    <!-- {{ derivedWindow }} -->
    <div
      :class="{
        'window-info': true,
        active: currentWindowName === 'PROPOSAL',
        'green-bg': currentWindowName === 'PROPOSAL' && showAllWindow
      }"
      v-if="currentWindowName === 'PROPOSAL' || showAllWindow"
    >
      <label
        class="current-window-label"
        v-if="currentWindowName === 'PROPOSAL'"
        >Current Active Window</label
      >
      <h5>Proposal Window</h5>
      <div>
        <div>Start</div>
        <div>{{ formatDate(derivedWindow.proposalWindow[0]) }}</div>
      </div>
      <div>
        <div>End</div>
        <div>{{ formatDate(derivedWindow.proposalWindow[1]) }}</div>
      </div>
    </div>
    <div
      :class="{
        'window-info': true,
        active: currentWindowName === 'VOTING',
        'green-bg': currentWindowName === 'VOTING' && showAllWindow
      }"
      v-if="currentWindowName === 'VOTING' || showAllWindow"
    >
      <label class="current-window-label" v-if="currentWindowName === 'VOTING'"
        >Current Active Window</label
      >
      <h5>Voting Window</h5>
      <div>
        <div>Start</div>
        <div>{{ formatDate(derivedWindow.votingWindow[0]) }}</div>
      </div>
      <div>
        <div>End</div>
        <div>{{ formatDate(derivedWindow.votingWindow[1]) }}</div>
      </div>
    </div>
    <div
      :class="{
        'window-info': true,
        active: currentWindowName === 'GRACE',
        'green-bg': currentWindowName === 'GRACE' && showAllWindow
      }"
      v-if="currentWindowName === 'GRACE' || showAllWindow"
    >
      <label class="current-window-label" v-if="currentWindowName === 'GRACE'"
        >Current Active Window</label
      >
      <h5>Grace Window</h5>
      <div>
        <div>Start</div>
        <div>{{ formatDate(derivedWindow.graceWindow[0]) }}</div>
      </div>
      <div>
        <div>End</div>
        <div>{{ formatDate(derivedWindow.graceWindow[1]) }}</div>
      </div>
    </div>
    <div
      :class="{
        'window-info': true,
        active: currentWindowName === 'APPLY',
        'green-bg': currentWindowName === 'APPLY' && showAllWindow
      }"
      v-if="currentWindowName === 'APPLY' || showAllWindow"
    >
      <label class="current-window-label" v-if="currentWindowName === 'APPLY'"
        >Current Active Window</label
      >
      <h5>Apply Window</h5>
      <div>
        <div>Start</div>
        <div>{{ formatDate(derivedWindow.applyWindow[0]) }}</div>
      </div>
      <div>
        <div>End</div>
        <div>{{ formatDate(derivedWindow.applyWindow[1]) }}</div>
      </div>
    </div>
  </div>
</template>
<script>
import moment from 'moment'
export default {
  data: function () {
    return {
      showAllWindow: false,
      moment
    }
  },
  props: {
    window: {
      type: Object,
      required: true
    },
    currentWindowName: {
      type: String
    }
  },
  computed: {
    derivedWindow () {
      if (this.window.proposalWindow) {
        console.log(this.window)
        return Object.assign({}, this.window)
      } else if (this.window.devProposalWindow) {
        console.log({
          proposalWindow: this.window.devProposalWindow,
          votingWindow: this.window.devVotingWindow,
          graceWindow: this.window.devGraceWindow,
          applyWindow: this.window.devApplyWindow
        })
        return {
          proposalWindow: this.window.devProposalWindow,
          votingWindow: this.window.devVotingWindow,
          graceWindow: this.window.devGraceWindow,
          applyWindow: this.window.devApplyWindow
        }
      }
    }
  },
  methods: {
    formatDate (ts) {
      return moment(ts)
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
  .window-info {
    margin: 10px auto;
    box-shadow: 0px 2px 5px #aaa;
    padding: 10px;
    border-radius: 5px;
    background: #fbfbfb;
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
