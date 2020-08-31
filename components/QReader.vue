<template>
  <div
    v-if="scanning"
    class="qr-scanner-container"
  >
    <p class="camera-error-message">
      {{ this.cameraErrorMessage }}
    </p>
    <qrcode-stream
      v-if="!cameraErrorMessage"
      :paused="!scanning"
      @decode="onDecode"
      @init="onInit"
    />
    <!-- <b-button variant="primary" @click="hideScanner" class="cancel-scanner-btn">Cancel</b-button> -->
  </div>
</template>

<script>
import MessageListItem from "~/components/MessageListItem";
import { mapGetters } from "vuex";
import VueQrcodeReader from "vue-qrcode-reader";
import Vue from "vue";

const defaultCamera = {
  audio: false, // don't request microphone access
  video: {
    facingMode: { ideal: "environment" }, // use rear camera if available
    width: { min: 360, ideal: 680, max: 1920 }, // constrain video width resolution
    height: { min: 240, ideal: 480, max: 1080 } // constrain video height resolution
  }
};

Vue.use(VueQrcodeReader);

export default {
  props: ["onDetectQR", "scanning"],
  data: function() {
    return {
      cameraErrorMessage: "",
      result: "",
      camera: null
    };
  },
  updated() {
    console.log(this.scanning)
  },
  computed: {
    ...mapGetters({
      getWallet: "wallet/getWallet",
      getAppState: "chat/getAppState",
      isUIReady: "chat/isUIReady"
    }),
    isUser() {
      return this.message.handle === this.getWallet.handle;
    },
    isFriend() {
      return !this.isUser;
    }
  },
  methods: {
    onDecode(decodedString) {
      this.onDetectQR(decodedString)
      console.log(decodedString);
      
    },
    async onInit(promise) {
      try {
        await promise;
      } catch (error) {
        console.log(error);
        if (error.name === "NotAllowedError") {
          this.cameraErrorMessage =
            "ERROR: you need to grant camera access permisson";
        } else if (error.name === "NotFoundError") {
          this.cameraErrorMessage = "ERROR: no camera on this device";
        } else if (error.name === "NotSupportedError") {
          this.cameraErrorMessage =
            "ERROR: secure context required (HTTPS, localhost)";
        } else if (error.name === "NotReadableError") {
          this.cameraErrorMessage = "ERROR: is the camera already in use?";
        } else if (error.name === "OverconstrainedError") {
          this.cameraErrorMessage = "ERROR: installed cameras are not suitable";
        } else if (error.name === "StreamApiNotSupportedError") {
          this.cameraErrorMessage =
            "ERROR: Stream API is not supported in this browser";
        }
      }
    }
  }
};
</script>

<style>
.qr-scanner-container {
  margin: 20px;
  border: 5px solid #3b3f40;

}
</style>
