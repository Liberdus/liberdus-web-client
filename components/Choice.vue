<template>
  <div class="choice">
    <div class="tag">{{ tag }}</div>
    <div class="value">{{ value }}</div>
  </div>
</template>
<script>
export default {
  props: ["tag", "value"]
};
</script>
<style scoped>
.choice {
  width: 300px;
  height: 40px;
  background: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(206, 206, 206, 0.5);
  border-radius: 5px;
  display: flex;
  justify-content: flex-start;
  padding-left: 20px;
  align-items: center;
  margin: 10px auto;
}
.choice .tag {
  width: 23px;
  height: 23px;
  border-radius: 20px;
  border: none;
  background: #2648d8;
  font-family: Poppins;
  font-weight: 700;
  font-size: 12px;
  color: #ffffff;
  letter-spacing: 0.47px;
  text-align: center;
  padding-top: 2px;
}
.choice .value {
    font-family: Poppins;
  font-weight: 700;
  font-size: 14px;
  color: #0a2463;
  letter-spacing: 0.54px;
  line-height: 30px;
  margin-left: 20px;
}
</style>