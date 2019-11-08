<template>
  <h1 class="title">{{ text }}</h1>
</template>
<script>
export default {
  props: {
    text: {
      required: true,
      type: String
    }
  }
};
</script>
<style scoped>
.title {
  font-family: Poppins-Medium;
  font-size: 28px;
  color: #0a2463;
  letter-spacing: 0;
  text-align: center;
}
</style>