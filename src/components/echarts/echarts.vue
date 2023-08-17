<template>
  <div class="hello">
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="刻度最小值">
        <el-input v-model="setKey.ymin" placeholder="最小值" />
      </el-form-item>
      <el-form-item label="刻度最大值">
        <el-input v-model="setKey.ymax" placeholder="最大值" />
      </el-form-item>
      <el-form-item label="最小间隔值">
        <el-input v-model="setKey.minInterval" type="number" placeholder="数量" />
      </el-form-item>
      <el-form-item label="最大间隔数字">
        <el-input v-model="setKey.maxSplitNumber" type="number" placeholder="数量" />
      </el-form-item>
      <el-form-item label="曲线">
        <el-select v-model="setKey.isSmooth" placeholder="请选择">
          <el-option label="是" :value="true"/>
          <el-option label="否" :value="false"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">生成</el-button>
      </el-form-item>
    </el-form>
<!--    <div ref="echartheight"></div>-->
    <div class="echart" :style="`height: 75%`" ref="echart" />
  </div>
</template>

<script>
import * as echarts from "echarts";
import {calculateMaxMin} from '@/utils/echart-extreme'
import { markRaw } from 'vue'
export default {
  name: 'HelloWorld',
  props: {
    echartsData: {
      type: Array,
      default: () => []
    },
    caleType: {
      type: String,
      default: 'csy'
    }
  },
  data() {
    return {
      echartheight: 0,
      setKey: {
        max: 50,
        min: 0,
        ymin: null,
        ymax: '',
        count: 5,
        maxSplitNumber: 10,
        length: 10,
        isSmooth: false,
        minInterval: 0.5
      },
      myChart: null
    }
  },
  computed: {
  },
  watch: {
    echartsData: {
      handler: function (val) {
        console.log(val)
        this.drawChart(val)
      },
      deep: true
    }
  },
  mounted() {
    // this.onSubmit()
    // echarts自适应
    window.addEventListener("resize", () => {
      this.myChart?.resize()
    })
  },
  methods: {
    downLoad () {
      // 日期
      const exportName = 'data' + new Date().toLocaleDateString()
      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.echartsData));
      var downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",     dataStr);
      downloadAnchorNode.setAttribute("download", exportName + ".json");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    },
    onSubmit() {
      // if (parseInt(this.setKey.min) > parseInt(this.setKey.max)) {
      //   this.$message.error('最小值不能大于最大值')
      //   return
      // }
      // this.echartsData = []
      // // 随机数允许两位小数
      // let random = (min, max) => {
      //   max = max * 100
      //   min = min * 100
      //   return Math.floor(Math.random() * (max - min + 1) + min)/100;
      // }
      // let { max, min, count, length } = this.setKey
      // const maxmin = max - min
      // for (let i = 0; i < parseInt(count); i++) {
      //   this.echartsData[i] = []
      //   const rate = (i+1) / parseInt(count)
      //   for (let j = 0; j < parseInt(length); j++) {
      //     this.echartsData[i].push(random(parseFloat(min) + (maxmin * rate), parseFloat(max) - (maxmin * rate)))
      //   }
      // }
      this.drawChart(this.echartsData)
     },
    drawChart(echartsData, selected) {
      const all = []
      if (!selected) echartsData.map(item => all.push(...item))
      else if (typeof selected === 'object') {
        for (let key in selected) {
          if (selected[key]) {
            echartsData[key].map(item => all.push(item))
          }
        }
      }
      const obj = calculateMaxMin(all, {
        ymin: this.setKey.ymin ?? Number.MIN_VALUE,
        ymax: this.setKey.ymax,
        minInterval: this.setKey.minInterval,
        maxSplitNumber: this.setKey.maxSplitNumber
      })
      // 基于准备好的dom，初始化echarts实例  这个和上面的main对应
      if (!this.myChart) {
        this.myChart = markRaw(echarts.init(this.$refs.echart))
        var that = this
        this.myChart.on('legendselectchanged', function(params) {
          that.drawChart(that.echartsData, params.selected)
        })
      }
      // 指定图表的配置项和数据
      let option = {
        title: {
          text: "ECharts 入门示例",
        },
        // echarts弹窗配置
        tooltip: {
          trigger: "axis",
        },
        legend: {
          selected: selected ?? {},
        },
        xAxis: {
          // 字符串转数字
          data: new Array(119).fill(0).map((item, index) => index),
          axisLabel: {
            interval: 0, //如果设置为 1，表示『隔一个标签显示一个标签』，如果值为 2，表示隔两个标签显示一个标签，以此类推。
            formatter: function (value) {
              if (value % 12 === 0) // 被12整除返回年
              return "第" + value / 12 + "年";
            },
          },
        },
        yAxis: {
          ...obj
        },
        series: echartsData.map((item, index) => {
          return {
            name: index.toString(),
            smooth: this.setKey.isSmooth,
            type: "line",
            data: [...item],
          }
        })
      };

      // 使用刚指定的配置项和数据显示图表。
      this.$nextTick(() => {
        this.myChart.setOption(option)
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.hello{
  width: 100%;
  height: 100%;
}
.echart{
  width: 100%;
  height: 80%;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
