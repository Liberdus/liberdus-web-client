<template>
  <div class="chat-input-container">
    <a-row style="width: 100%" :gutter="16">
      <a-col :span="24" style="height: 30px;">
        <p
          v-if="!isFriend && notEnoughCoin"
          class="required-toll not-enough-toll"
        >
          Not Enough coin to pay toll
        </p>

        <p
          v-else-if="!isFriend"
          class="required-toll"
        >
          <strong>Total Cost: {{ requiredToll + requiredFee }} coins</strong>
          (Toll {{ requiredToll }} coins + Tx fee {{ requiredFee }} coins)
        </p>

        <p
          v-else-if="isFriend"
          class="required-toll"
        >
          <strong>Total Cost: {{ requiredFee }} coins</strong>
          (Tx Fee)
        </p>
      </a-col>

      <a-col :span="24">
        <a-row>
          <img class="attached-img" v-if="imageUrl" :src="imageUrl" alt="avatar"/>
          <p v-if="imageUrl">File size: {{ fileSize  }} KB <a-icon  @click="removeAttachment" type="delete" /></p>

        </a-row>
        <a-row :gutter="16">
          <a-col :span="24">
            <div style="display: flex; align-items: center; gap: 10px;">
              <a-input
                  v-model="message"
                  type="text"
                  placeholder="Type your message"
                  :disabled="notEnoughCoin"
                  @keyup.enter="submitMessage"
                  style="flex: 1;"
              />
              <a-upload
                  name="avatar"
                  class="avatar-uploader"
                  :show-upload-list="false"
                  :before-upload="beforeUpload"
                  @change="handleChange"
              >
                <a-icon type="paper-clip" />
              </a-upload>
            </div>
          </a-col>
        </a-row>

      </a-col>
    </a-row>
  </div>
</template>

<script>
import utils from '../assets/utils'
import { mapGetters } from 'vuex'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

function getBase64 (img, callback) {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result))
  reader.readAsDataURL(img)
}
export default {
  props: ['friend', 'isFriend', 'setPendingMessage'],
  components: {
    PlusOutlined,
    LoadingOutlined
  },
  data: function () {
    return {
      message: '',
      requiredToll: null,
      requiredFee: 0.0,
      loading: false,
      imageUrl: '',
      fileSize: 0
    }
  },
  computed: {
    ...mapGetters({
      getWallet: 'wallet/getWallet',
      getAppState: 'chat/getAppState'
    }),
    notEnoughCoin () {
      // if (this.getAppState.data.balance < parseFloat(this.requiredToll))
      //   return true;
      // return false;
      return false
    }
  },
  async mounted () {
    const to = await utils.getAddress(this.friend)
    this.requiredToll = await utils.getToll(to, this.getWallet.entry.address)
    const network = await utils.queryParameters()
    if (network.current.transactionFee) {
      this.requiredFee = network.current.transactionFee
    }
  },
  methods: {
    async submitMessage () {
      let messageToSend = {
        text: this.message,
        attachment: this.imageUrl ? this.imageUrl : null
      }
      this.message = ''
      let myWallet = this.getWallet
      let {success, pendingTx} = await utils.sendMessage(
        messageToSend,
        myWallet,
        this.friend
      )
      this.imageUrl = ''
      if (success) {
        this.setPendingMessage({
          handle: this.getWallet.handle,
          timestamp: null,
          message: pendingTx.message,
          messageHash: utils.hashMessage(JSON.parse(pendingTx.message)),
        })
      } else {
        message.error('Failed to send message')
      }
    },
    /**
     * Handle the change event when a file is selected.
     */
    handleChange (info) {
      if (info.file.status === 'uploading') {
        this.loading = true
        return
      }
      if (info.file.status === 'done') {

        // Convert the uploaded file to Base64
        this.getBase64(info.file.originFileObj, (base64) => {
          // this.imageUrl = base64
          this.loading = false
        })
      }
    },
    /**
     * Validate the file before upload and convert to Base64 if valid.
     */
    beforeUpload(file) {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG files!');
        return false;
      }

      const maxSizeInKB = 4;
      // Check if the file size is less than 5 KB
      if (file.size / 1024 < maxSizeInKB) {
        this.getBase64(file, (base64) => {
          this.imageUrl = base64;
          this.loading = false;
          this.fileSize = (file.size / 1024).toFixed(2);
        });
        return false;
      }

      // If file is larger than 10 KB, resize it
      this.resizeImage(file, maxSizeInKB, (resizedBase64) => {
        this.imageUrl = resizedBase64;
        // Calculate the size of the Base64 string in KB
        const base64Length = this.imageUrl.length;
        const sizeInBytes = (base64Length * 3) / 4 -
            (this.imageUrl.endsWith('==') ? 2 : this.imageUrl.endsWith('=') ? 1 : 0);
        const sizeInKB = sizeInBytes / 1024;
        this.fileSize = sizeInKB.toFixed(2);
        this.loading = false;
      });

      return false; // Prevent the default upload behavior
    },
    removeAttachment() {
      this.imageUrl = ''
    },
    /**
     * Helper function to convert a file to a Base64 string.
     */
    getBase64 (file, callback) {
      const reader = new FileReader()
      reader.addEventListener('load', () => callback(reader.result))
      reader.readAsDataURL(file)
    },
    async resizeImage(file, maxSizeInKB, callback) {
      const img = await this.loadImageFromFile(file); // Load image asynchronously
      const initialScale = 0.5; // Reduce size initially to optimize performance

      let width = img.width * initialScale;
      let height = img.height * initialScale;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      let attempt = 0;
      const MAX_TRIES = 10; // Limit the number of compression attempts

      // Throttle to avoid performance issues during resizing
      const compressImage = async () => {
        console.log(`Attempt ${attempt + 1}: Resizing image to ${width}x${height}`);
        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL('image/jpeg', 0.7); // Adjust quality as needed
        const sizeInKB = (base64.length * 3) / 4 / 1024; // Estimate size in KB

        if (sizeInKB < maxSizeInKB || attempt >= MAX_TRIES) {
          callback(base64); // Return the resized Base64 image
          return;
        }

        // Reduce size further and try again
        width *= 0.5;
        height *= 0.5;
        attempt++;

        // Throttle the loop to avoid performance issues
        await new Promise((resolve) => setTimeout(resolve, 50)); // Small delay to prevent blocking

        compressImage(); // Retry compression
      };
      compressImage(); // Start compression
    },
    loadImageFromFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          img.onload = () => resolve(img);
          img.onerror = (err) => reject(err);
        };

        reader.onerror = (err) => reject(err);
      });
    }

  }
}
</script>

<style>
.chat-input-container {
  //height: 63px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: calc(100% - 200px);
  position: fixed;
  left: 200px;
  /* top: calc(100% - 50px); */
  bottom: 0px;
  background: #efefef;
  box-shadow: 0 -2px 4px 0 rgba(206, 206, 206, 0.5);

  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 25px;
}
@media screen and (max-width: 992px) {
  .chat-input-container {
    left: 0px;
    width: 100%;
  }
}
.text-input.chat-input {
  height: 40px;
  width: 90%;
  max-width: 600px;
  padding: 5px 15px;
  font-size: 14px;
}
.chat-input-container .required-toll {
  text-align: left;
  padding-left: 5px;
  padding-top: 10px;
  color: #d79341;
  max-width: 600px;
  position: relative;
}
.chat-input-container .required-toll.not-enough-toll {
  color: red;
}
input[type='text'],
input[type='number'],
textarea {
  font-size: 16px !important;
}

.avatar-uploader > .ant-upload {
  width: 128px;
  height: 128px;
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}

.attached-img {
  //width: 50px;
  //height: 50px;
  margin: 10px;
}

.avatar-uploader > .ant-upload {
  width: 0px;
  height: 0px;
}

</style>
