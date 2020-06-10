<template>
  <button class="default-button" @click="onClick" :disabled="isDisabled">
    {{ text }}
  </button>
</template>
<script>
export default {
  props: {
    text: {
      type: String
    },
    onClick: {
      type: Function,
      default: function () {
        console.log('click')
      }
    },
    isDisabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    defaultOnClick () {
      console.log('Click')
    }
  }
}
</script>
<style scoped>
.default-button {
  background: #2648d8;
  box-shadow: 0 3px 4px 3px rgba(203, 203, 203, 0.2),
    0 4px 8px 0 rgba(0, 0, 0, 0.08);
  border-radius: 30px;
  font-family: Poppins;
  font-size: 13px;
  color: #ffffff;
  letter-spacing: -0.14px;
  text-align: center;
  width: 100%;
  max-width: 600px;
  min-width: 300px;
  height: 55px;
  cursor: pointer;
  outline: none;
  position: relative;
  display: block;
  margin: 10px auto;
}
.default-button:disabled {
  background: #d1d1d1;
  cursor: not-allowed;
}
</style>
