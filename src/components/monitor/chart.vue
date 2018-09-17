<template>
  <div :class="chartClass" :style="{height:height,width:width}"></div>
</template>

<script type="text/ecmascript-6">
import echarts from 'echarts'
import {debounce} from 'common/utils'
require('echarts/theme/macarons') // echarts theme

export default {
  props: {
    chartClass: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object
    },
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this._initChart()
    if (this.autoResize) {
      this.__resizeHanlder = debounce(() => {
        if (this.chart) {
          this.chart.resize()
        }
      }, 100)
      window.addEventListener('resize', this.__resizeHanlder)
    }
  },
  methods: {
    _initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this._setOptions(this.chartData)
    },
    _setOptions({ name, xData, yData } = {}) {
      this.chart.setOption({
        xAxis: {
          data: xData,
          boundaryGap: false,
          axisTick: {
            show: false
          }
        },
        grid: {
          left: 10,
          right: 10,
          bottom: 20,
          top: 30,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          padding: [5, 10]
        },
        yAxis: {
          axisTick: {
            show: false
          }
        },
        legend: {
          data: [name]
        },
        series: [{
          name: name,
          itemStyle: {
            normal: {
              color: '#FF005A',
              lineStyle: {
                color: '#FF005A',
                width: 1
              }
            }
          },
          smooth: true,
          type: 'line',
          data: yData,
          animationDuration: 2800,
          animationEasing: 'cubicInOut'
        }]
      })
    }
  },
  watch: {
    // 当浏览器放大到全屏时重新调整图标大小，保证样式正确
    isShow(val) {
      if (val) {
        debounce(() => {
          this.chart.resize()
        }, 10)()
      }
    },
    chartData: {
      deep: true,
      handler(val) {
        this._setOptions(val)
      }
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

</style>
