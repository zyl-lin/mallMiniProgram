<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>今日销售额</span>
          </div>
          <div class="card-panel">
            <span class="card-panel-num">¥ {{ salesData.today }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>本周销售额</span>
          </div>
          <div class="card-panel">
            <span class="card-panel-num">¥ {{ salesData.week }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>本月销售额</span>
          </div>
          <div class="card-panel">
            <span class="card-panel-num">¥ {{ salesData.month }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="chart-wrapper">
      <div slot="header" class="clearfix">
        <span>销售趋势</span>
      </div>
      <div class="chart-container">
        <line-chart :chart-data="trendData" />
      </div>
    </el-card>

    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>热销商品排行</span>
      </div>
      <el-table :data="hotGoods" style="width: 100%">
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="sales" label="销量" width="180" />
        <el-table-column prop="amount" label="销售额" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getSalesStats, getSalesTrend, getHotGoods } from '@/api/statistics'
import LineChart from '@/components/Charts/LineChart'

export default {
  name: 'SalesStatistics',
  components: {
    LineChart
  },
  data() {
    return {
      salesData: {
        today: 0,
        week: 0,
        month: 0
      },
      trendData: {
        labels: [],
        datasets: []
      },
      hotGoods: []
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        const [salesRes, trendRes, hotGoodsRes] = await Promise.all([
          getSalesStats(),
          getSalesTrend(),
          getHotGoods()
        ])
        this.salesData = salesRes.data
        this.trendData = trendRes.data
        this.hotGoods = hotGoodsRes.data
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