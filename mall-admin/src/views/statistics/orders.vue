<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" v-for="(item, index) in orderStats" :key="index">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>{{ item.label }}</span>
          </div>
          <div class="card-panel">
            <span class="card-panel-num">{{ item.value }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="chart-wrapper">
      <div slot="header" class="clearfix">
        <span>订单转化率</span>
      </div>
      <div class="chart-container">
        <pie-chart :chart-data="conversionData" />
      </div>
    </el-card>
  </div>
</template>

<script>
import { getOrderStats, getConversionStats } from '@/api/statistics'
import PieChart from '@/components/Charts/PieChart'

export default {
  name: 'OrderStatistics',
  components: {
    PieChart
  },
  data() {
    return {
      orderStats: [],
      conversionData: {
        labels: [],
        datasets: []
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        const [orderRes, conversionRes] = await Promise.all([
          getOrderStats(),
          getConversionStats()
        ])
        this.orderStats = orderRes.data
        this.conversionData = conversionRes.data
      } catch (error) {
        console.error('获取数据失败:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-panel {
  height: 108px;
  text-align: center;
  font-size: 12px;
  position: relative;
  
  .card-panel-num {
    font-size: 36px;
    font-weight: bold;
  }
}

.chart-wrapper {
  background: #fff;
  padding: 16px 16px 0;
  margin-bottom: 32px;
}

.chart-container {
  position: relative;
  width: 100%;
  height: 400px;
}
</style> 