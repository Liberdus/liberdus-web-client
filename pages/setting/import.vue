<template>
  <v-ons-page>
    <tool-bar :option="{ menu: false, back: true, backUrl: '/welcome' }" />
    <div v-if="!needsNameRegistration" class="import-account-container">
      <p class="text-body">
        Enter or Scan your
        <strong>Secret Key</strong> to import your account.
      </p>
      <q-reader :on-detect-q-r="onDetectSk" :scanning="showScanner" />
      <v-ons-button v-if="showScanner" class="new-message-btn" modifier="quiet" @click="onClickQRScanner">
        Close QR Scanner
      </v-ons-button>

      <div class="secret-input-container">
        <a-input placeholder="Secret Key" size="large" v-model="privateKey">
        </a-input>
        <a-button slot="enterButton" @click="onClickQRScanner" class="qr-code-btn">
          <img src="../../assets/qrcode.png" alt="qr-code" />
        </a-button>
        <!-- <input
          v-model="privateKey"
          placeholder="Secret key"
          class="text-input"
        >
        <v-ons-button
          modifier="quiet"
          class="qr-code-btn"
          @click="onClickQRScanner"
        >
          <img
            src="../../assets/qrcode.png"
            alt="qr-code"
          >
        </v-ons-button> -->
      </div>

      <a-button @click="onImportAccount" size="large" type="primary" :loading="loadingImport" :disabled="!secretKey">
        Import Account
      </a-button>
    </div>

    <div v-else class="name-container">
      <a-card title="Register Username">
        <form class="name-form">
          <div class="name-input-container">
            <p class="body">
              Register a username for your imported account
            </p>
            <a-input v-model="name" type="text" placeholder="Username" size="large" />
          </div>
          <div class="error-message-container">
            <p v-if="$v.name.required && !$v.name.alphaNum" class="input-error-message">
              Username can contain only alphabets and numeric characters
            </p>
            <p v-else-if="$v.name.required && !$v.name.minLength" class="input-error-message">
              Username must be at least 3 characters long
            </p>
            <div v-else-if="!checkingUsername">
              <p v-if="isUsernameTaken" class="input-error-message">
                Username is already taken.
              </p>
              <p v-else-if="isUsernameAnotherNetwork" class="input-error-message">
                Username is on another network.
              </p>
              <p v-else-if="isUsernameAvailable" class="input-success-message">
                Username is available.
              </p>
            </div>
            <div v-else-if="checkingUsername && !registeringName">
              <p class="input-checking-message">
                Checking username...
              </p>
            </div>
          </div>
          <a-button :disabled="!isNameValid || checkingUsername" @click="onRegisterName" size="large" shape="round"
            type="primary" style="width: 100%; margin-bottom:20px" :loading="registeringName">
            Register
          </a-button>
        </form>
      </a-card>
    </div>
  </v-ons-page>
</template>

<script>
import Vue from 'vue';
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import Vuelidate from 'vuelidate';
import { required, minLength, alphaNum } from 'vuelidate/lib/validators';
import VueOnsen from 'vue-onsenui/esm';
import OnsenComponents from '~/components/Onsen';
import ChatText from '~/components/ChatText';
import ChatInput from '~/components/ChatInput';
import QReader from '~/components/QReader';
import utils from '../../assets/utils';
import { mapActions } from 'vuex';
import ToolBar from '~/components/ToolBar';
import Title from '~/components/baisc/Title';
import Button from '~/components/baisc/Button';

Vue.use(Vuelidate);
Vue.use(VueOnsen);
Object.values(OnsenComponents).forEach((c) => Vue.component(c.name, c));

export default {
  components: {
    QReader,
    ToolBar,
    Button,
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.previousUrl = from.path;
    });
  },
  data: function() {
    return {
      privateKey: '',
      previousUrl: '/',
      showScanner: false,
      needsNameRegistration: false,
      name: "",
      nameError: "",
      importedWallet: null,

      // Validation states
      isUsernameTaken: false,
      isUsernameAvailable: false,
      isUsernameAnotherNetwork: false,
      checkingUsername: false,
      nameCheckerTimeout: null,
      loadingImport: false,
      registeringName: false,
    };
  },
  validations: {
    name: {
      required,
      minLength: minLength(3),
      alphaNum,
    },
  },
  computed: {
    isNameValid() {
      return (
        !this.$v.name.$invalid &&
        !this.isUsernameTaken &&
        !this.checkingUsername &&
        !this.isUsernameAnotherNetwork
      );
    },
  },
  methods: {
    ...mapActions({
      addWallet: 'wallet/addWallet',
    }),
    async checkUsername() {
      if (!this.name) {
        this.resetUsernameStates();
        return;
      }

      let oldName = this.name;
      let lowUsername = oldName.toLowerCase();

      // Check UsernameHash in localStore
      let localWallets = null;
      try {
        localWallets = JSON.parse(localStorage.getItem("wallets"));
      } catch (e) {}

      // Check UsernameHash in remoteNetwork
      let remoteAddress = null;
      try {
        remoteAddress = await utils.getAddress(lowUsername);
      } catch (e) {}

      let foundInLocalWallet = null;
      try {
        if (localWallets && remoteAddress) {
          foundInLocalWallet = localWallets.find(
            (w) => w.entry.address === remoteAddress
          );
        }
      } catch (e) {}

      let foundInLocalWalletByHandle = null;
      try {
        if (localWallets) {
          foundInLocalWalletByHandle = localWallets.find(
            (w) => w.handle === lowUsername
          );
        }
      } catch (e) {}

      // Prevent race conditions
      if (oldName !== this.name) {
        return;
      }

      // Reset states
      this.resetUsernameStates();

      if (remoteAddress && !foundInLocalWallet) {
        this.isUsernameTaken = true;
      } else if (remoteAddress && foundInLocalWallet) {
        this.isUsernameTaken = true;
      } else if (!remoteAddress && foundInLocalWalletByHandle) {
        this.isUsernameAnotherNetwork = true;
      } else if (!remoteAddress && !foundInLocalWallet) {
        this.isUsernameAvailable = true;
      }

      this.checkingUsername = false;
    },
    resetUsernameStates() {
      this.isUsernameTaken = false;
      this.isUsernameAvailable = false;
      this.isUsernameAnotherNetwork = false;
      this.checkingUsername = false;
    },
    onDetectSk(sk) {
      this.privateKey = sk;
      this.showScanner = false;
    },
    redirect(url, option) {
      this.$router.push(url);
      if (url === '/' && option) {
      }
    },
    onClickAddSign() {},
    onClickQRScanner() {
      console.log('onClickQRScanner');
      this.showScanner = !this.showScanner;
    },
    async onImportAccount() {
      if (!this.secretKey) return;
      this.loadingImport = true;
      try {
        let { handle, entry } = await utils.importWallet(
          this.privateKey.toLowerCase()
        );

        console.log("onImportAccount", { handle, entry });

        if (handle === "Nousername") {
          // If no username, show name registration
          this.needsNameRegistration = true;
          this.importedWallet = { handle, entry };
        } else {
          // Proceed with normal wallet import
          let wallet = { handle, entry };
          utils.saveWallet(wallet);
          this.addWallet(wallet);
          this.$router.push("/?tabIndex=0");
        }
      } catch (e) {
        this.$notification.error({
          message: "Failed to import account",
          description: e.message,
        });
      } finally {
        this.loadingImport = false;
      }
    },
    async onRegisterName() {
      this.registeringName = true;
      this.checkingUsername = true;
      this.nameError = "";

      // First, check username validity
      await this.checkUsername();

      if (!this.isNameValid) {
        this.nameError = this.generateNameError();
        this.checkingUsername = false;
        this.registeringName = false;
        return;
      }

      try {
        // Attempt to register name
        const handle = this.name.toLowerCase();
        let isSubmitted = await utils.registerAlias(
          handle,
          this.importedWallet.entry
        );

        if (isSubmitted) {
          let isRegistered;
          let accountRegisteredChecker = setInterval(async () => {
            isRegistered = await this.checkNameRegistered(handle);
            if (isRegistered) {
              clearInterval(accountRegisteredChecker);
              accountRegisteredChecker = null;
              this.registeringName = false;
              // Update wallet with new name and save
              const updatedWallet = {
                ...this.importedWallet,
                id: utils.aliasId(handle),
                handle: handle,
              };

              utils.saveWallet(updatedWallet);
              this.addWallet(updatedWallet);

              this.$router.push("/?tabIndex=0");
            }
          }, 1000);
        }
      } catch (error) {
        this.nameError = "An error occurred while registering name";
        console.error(error);
      }
    },
    generateNameError() {
      if (this.$v.name.$invalid) {
        if (!this.$v.name.minLength) {
          return "Name must be at least 3 characters long";
        }
        if (!this.$v.name.alphaNum) {
          return "Name can contain only alphabets and numeric characters";
        }
      }
      if (this.isUsernameTaken) {
        return "Name is already taken";
      }
      if (this.isUsernameAnotherNetwork) {
        return "Name is on another network";
      }
      return "Please enter a valid name";
    },
    async registerNameOnBackend(name) {
      // Add username registration logic here
      try {
      } catch (error) {
        console.error("Name registration error:", error);
        return false;
      }
    },
    async checkNameRegistered(handle) {
      let address = await utils.getAddress(handle);
      if (address) {
        console.log(`Registered name successfully.`);
        return true;
      }
      return false;
    },
  },
  watch: {
    name(newValue) {
      // Add a debounce mechanism for username checking
      if (this.nameCheckerTimeout) {
        clearTimeout(this.nameCheckerTimeout);
      }
      this.checkingUsername = true;
      this.nameCheckerTimeout = setTimeout(this.checkUsername, 500);
    },
  },
};
</script>

<style>
.import-account-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  margin-top: 50px;
  height: auto;
  text-align: center;
  padding: 20px;
}
.private-key-input {
  margin-right: 5px;
}
.qr-code-btn {
  height: 40px;
  padding: 5px;
}

.secret-input-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px auto;
}
.name-container {
  width: 90%;
  max-width: 600px;
  margin: 30px auto;
  text-align: center;
}
.name-form .name-input-container {
  margin-bottom: 0px;
}
.name-form .error-message-container {
  height: 20px;
}
.name-form .input-error-message {
  text-align: left;
  color: red;
  height: 20px;
}
.input-error-message {
  color: red;
  font-weight: normal !important;
}
.input-success-message {
  color: green;
}
.input-checking-message {
  color: #333;
  font-size: 12px;
  text-align: left;
}
</style>
