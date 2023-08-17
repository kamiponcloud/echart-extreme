<script setup>
import { ref, watch, onMounted, defineProps } from 'vue';
import * as echarts from 'echarts';
import { calculateMaxMin, getAverageMaxMin } from '@/utils/echart-extreme';

// 定义 props
const props = defineProps({
    echartsData: {
        type: Array,
        default: () => [],
    },
});

const echart = ref(null);
const setKey = ref({
    max: 50,
    min: 0,
    ymin: null,
    ymax: '',
    count: 5,
    maxSplitNumber: 10,
    length: 10,
    isSmooth: false,
    minInterval: 0.5,
});
const myChart = ref(null);

// 监听echartsData变化
watch(
    () => props.echartsData,
    (val) => {
        drawChart(val);
    },
    { deep: true }
);

function onSubmit(){
    drawChart(props.echartsData)
}

// 创建图表
function createChart() {
    if (!myChart.value) {
        myChart.value = echarts.init(echart.value);
        myChart.value.on('legendselectchanged', function (params) {
            drawChart(props.echartsData, params.selected);
        });
    }
}

// 绘制图表
function drawChart(echartsData, selected) {
    const all = []
    let right = []
    if (!selected) {
        echartsData.map((item, index) => {
            if (index !== 2) all.push(...item)
        });
        right = echartsData[2]
    }
    else if (typeof selected === 'object') {
        console.log(selected)
        for (let key in selected) {
            if (selected[key] && key !== '2') {
                echartsData[key].map((item) => all.push(item));
            } else if (selected[key] && key === '2') {
                right = echartsData[key]
            }
        }
    }
    const obj = calculateMaxMin(all, {
        ymin: setKey.value.ymin ?? Number.MIN_VALUE,
        ymax: setKey.value.ymax,
        minInterval: setKey.value.minInterval,
        maxSplitNumber: setKey.value.maxSplitNumber,
    });
    const obj2 = calculateMaxMin(right, {
        ymin: setKey.value.ymin ?? Number.MIN_VALUE,
        ymax: setKey.value.ymax,
        minInterval: setKey.value.minInterval,
        maxSplitNumber: setKey.value.maxSplitNumber,
    });
    const result = getAverageMaxMin(obj, obj2, {
        minInterval: setKey.value.minInterval,
    }, {
        minInterval: setKey.value.minInterval,
    })
    console.log(result)
    // 指定图表的配置项和数据
    let option = {
        title: {
            text: 'ECharts 入门示例',
        },
        // echarts弹窗配置
        tooltip: {
            trigger: 'axis',
        },
        legend: {
            selected: selected ?? {},
        },
        xAxis: {
            // 字符串转数字
            data: new Array(parseInt(setKey.value.length)).fill(0).map((item, index) => index),
        },
        yAxis: [{
            ...result[0],
        }, {
            type: 'value',
            ...result[1],
        }],
        series: echartsData.map((item, index) => {
            return {
                name: index.toString(),
                smooth: setKey.value.isSmooth,
                type: 'line',
                yAxisIndex: index === 2 ? 1 : 0,
                data: [...item],
            };
        }),
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.value.setOption(option);
}

onMounted(() => {
    // echarts自适应
    window.addEventListener('resize', () => {
        myChart.value?.resize();
    });

    createChart();
    drawChart(props.echartsData);
});
</script>


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
        <div class="echart" :style="`height: 75%`" ref="echart" />
    </div>
</template>

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
