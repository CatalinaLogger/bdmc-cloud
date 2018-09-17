<template>
  <div class="chartClass" :style="{height:height,width:width}"></div>
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
    _setOptions({ name, unit, xData, yData, oneLess, twoLess, twoMore, oneMore } = {}) {
      const option = {
        title: {
          text: unit
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          data: xData
        },
        grid: {
          left: 10,
          right: 60,
          bottom: 20,
          top: 30,
          containLabel: true
        },
        yAxis: {
          splitLine: {
            show: false
          }
        },
        dataZoom: [{
          type: 'inside'
        }],
        visualMap: {
          show: false,
          pieces: [{
            gt: oneMore,
            lte: twoMore,
            color: '#ffb344'
          }, {
            gt: twoLess,
            lte: oneLess,
            color: '#ffb344'
          }, {
            gt: twoMore,
            lte: twoLess,
            color: '#096'
          }],
          outOfRange: {
            color: '#ff0000'
          }
        },
        series: {
          name: name,
          type: 'line',
          data: yData,
          markLine: {
            silent: true,
            data: [{
              yAxis: oneLess,
              lineStyle: {
                color: '#ff0000'
              }
            }, {
              yAxis: twoLess,
              lineStyle: {
                color: '#ffb344'
              }
            }, {
              yAxis: twoMore,
              lineStyle: {
                color: '#ffb344'
              }
            }, {
              yAxis: oneMore,
              lineStyle: {
                color: '#ff0000'
              }
            }]
          }
        }
      }
      this.chart.setOption(option)
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
