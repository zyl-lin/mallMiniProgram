<template>
  <div class="chart-container">
    <canvas ref="chart"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js'

export default {
  name: 'PieChart',
  props: {
    chartData: {
      type: Object,
      required: true
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.initChart()
  },
  methods: {
    initChart() {
      this.chart = new Chart(this.$refs.chart.getContext('2d'), {
        type: 'pie',
        data: this.chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top'
            }
          }
        }
      })
    },
    setOptions(data) {
      this.chart.data = data
      this.chart.update()
    }
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style> 