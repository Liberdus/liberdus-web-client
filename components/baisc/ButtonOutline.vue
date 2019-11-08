<template>
  <button class="outline-button" @click="onClick">{{ text }}</button>
</template>
<script>
export default {
  props: {
    text: {
      type: String
    },
    onClick: {
      type: Function
    }
  }
};
</script>
<style scoped>
.outline-button {
  border: 2px solid #2648d8;
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.08), 0 4px 8px 0 rgba(0, 0, 0, 0.08);
  border-radius: 30px;
  font-family: Poppins;
  font-size: 15px;
  color: #2648d8;
  letter-spacing: -0.17px;
  text-align: center;
  width: 90%;
  max-width: 350px;
  min-width: 300px;
  height: 55px;
  cursor: pointer;
  background: transparent;
  display: block;
  position: relative;
  margin: 10px auto;
}
</style>