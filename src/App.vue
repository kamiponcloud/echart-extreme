<template>
<div class="container">
    <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="随机数据最大值">
            <el-input v-model="setKey.max" type="number" placeholder="最大值" />
        </el-form-item>
        <el-form-item label="随机数据最小值">
            <el-input v-model="setKey.min" type="number" placeholder="最小值" />
        </el-form-item>
        <el-form-item label="数量">
            <el-input v-model="setKey.count" type="number" placeholder="数量" />
        </el-form-item>
        <el-form-item label="长度">
            <el-input v-model="setKey.length" type="number" placeholder="长度" />
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="onSubmit">生成</el-button>
            <el-button type="primary" @click="downLoad">下载数据</el-button>
        </el-form-item>
    </el-form>
    <section style="width: 100%;height: 33%;">
        <echarts :echarts-data="echartsData" msg="Welcome to Your Vue.js App"/>
    </section>
    <section style="width: 100%;height: 60%;">
        <doubleCharts :echarts-data="echartsData" msg="Welcome to Your Vue.js App"/>
    </section>
</div>
</template>

<script setup>
import echarts from './components/echarts/echarts.vue'
import doubleCharts from './components/echarts/doubleCharts.vue'
import { ref, watch } from 'vue'
// 定义响应式数据setKey
const setKey = ref({
    max: 50,
    min: 0,
    count: 5,
    length: 120
})
// 数据echartsData
let echartsData = ref([])
// 定义一个方法
const onSubmit = () => {
  if (parseInt(setKey.value.min) > parseInt(setKey.value.max)) {
    this.$message.error('最小值不能大于最大值')
    return
  }
  const EchartsData = []
  // 随机数允许两位小数
  let random = (min, max) => {
    max = max * 100
    min = min * 100
    return Math.floor(Math.random() * (max - min + 1) + min)/100;
  }
  let { max, min, count, length } = setKey.value
  const maxmin = max - min
  for (let i = 0; i < parseInt(count); i++) {
    EchartsData[i] = []
    const rate = (i+1) / parseInt(count)
    for (let j = 0; j < parseInt(length); j++) {
      EchartsData[i].push(random(parseFloat(min) + (maxmin * rate), parseFloat(max) - (maxmin * rate)))
    }
  }
    echartsData.value = EchartsData
}

// 监听echartsData变化
// watch(() => echartsData, (newVal, oldVal) => {
// }, {deep: true})

</script>

<style>
body, html{
  width: 100%;
  height: 100%;
  border: 0;
  margin: 0;
  padding: 0;
  font-size: 14px;
  color: #333;
  text-decoration: none;
  list-style: none;
  outline: none;
  -webkit-tap-highlight-color: rgba(0,0,0,0);
  -webkit-touch-callout: none;
}
#app {
  width: 100%;
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  overflow: hidden;
}
</style>

<style scoped>
.container{
  width: 100%;
  height: 100%;
}
</style>
