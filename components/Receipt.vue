<template>
  <div v-if="isUIReady">
    <a-form
      :form="form"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 17 }"
      @submit="handleSubmit"
    >
      <a-form-item label="Server url">
        <a-input
          v-decorator="[
            'url',
            {
              rules: [
                {
                  required: true,
                  message: 'Please input explorer server url!',
                },
              ],
            },
          ]"
          placeholder="Input explorer server url."
          allowClear
        />
      </a-form-item>

      <a-form-item label="Transaction data">
        <a-textarea
          placeholder="Input your transaction data."
          v-model="txData"
          autosize
          allowClear
        />
      </a-form-item>

      <a-form-item label="Transaction status">
        <a-alert
          message="Applied"
          description="This transaction is applied."
          type="success"
          show-icon
          v-if="receiptStatus === 1"
        />

        <a-alert
          message="Rejected"
          description="This transaction is rejected."
          type="error"
          show-icon
          v-if="receiptStatus === 2"
        />

        <a-alert
          :message="receiptMessage"
          type="warning"
          show-icon
          v-if="receiptStatus === 3"
        />

        <a-alert
          :message="receiptMessage"
          type="warning"
          show-icon
          v-if="receiptStatus === 4"
        />
      </a-form-item>

      <a-form-item :wrapper-col="{
        xs: { span: 12, offset: 0 },
        sm: { span: 12, offset: 5 },
        md: { span: 12, offset: 5 },
        lg: { span: 12, offset: 5 },
        xl: { span: 12, offset: 5 },
        xxl: { span: 12, offset: 5 },
      }">
        <a-button
          type="primary"
          html-type="submit"
          size="large"
          :loading="submitLoading"
        >
          Submit
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import utils from '../assets/utils';
import {
  TX_RECEIPT_APPLIED,
  TX_RECEIPT_REJECTED,
  TX_RECEIPT_NOT_FOUND,
  TX_RECEIPT_ERROR,
} from '../constants/tx';
import { mapGetters, mapActions } from 'vuex';

export default {
  data() {
    return {
      formLayout: 'horizontal',
      form: this.$form.createForm(this, { name: 'coordinated' }),
      serverUrl: '',
      txData: '',
      receiptMessage: '',
      receiptStatus: 0,
      submitLoading: false,
      txId: '',
    };
  },
  computed: {
    ...mapGetters({
      isUIReady: 'chat/isUIReady',
      getAppState: 'chat/getAppState',
    }),
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault();
      // console.log('\n\n === handleSubmit: \n\n', this.serverUrl, this.txData)
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values);

          try {
            const { url } = values;
            const txData = this.txData
            let tx = JSON.parse(txData);
            this.submitLoading = true

            utils.getTxStatus(url, tx).then((data) => {
              console.log('\n\n === tx status: === \n\n', data);
              const { status, message } = data;
              this.receiptStatus = status;
              this.receiptMessage = message;
              this.submitLoading = false
            });
          } catch (e) {
            console.log(e);
              this.receiptStatus = TX_RECEIPT_ERROR;
              this.receiptMessage = 'Unexpected error occured while checking the transaction.';
          }
        }
      });
    },
  },
  mounted () {
    try {
      if (this.$route.query.txId) {
        let txId = this.$route.query.txId
        let txs = this.getAppState.data.transactions;
        let tx_query = txs.filter(tx => tx.txId === txId)
        console.log('\n\n === tx_query === \n\n', tx_query)

        if (tx_query && tx_query.length) {
          this.txData = JSON.stringify(tx_query[0], null, 2)
        }
      }
    } catch(e) {
      console.log(e)
      this.txId = ''
    }
  }
};
</script>
