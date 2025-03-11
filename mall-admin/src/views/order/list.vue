<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.order_no"
        placeholder="订单号"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select v-model="listQuery.status" placeholder="订单状态" clearable style="width: 120px" class="filter-item">
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%">
      <el-table-column label="订单号" prop="order_no" align="center" width="180" />
      <el-table-column label="用户" prop="receiver_name" align="center" width="100" />
      <el-table-column label="手机号" prop="receiver_phone" align="center" width="120" />
      <el-table-column label="订单金额" align="center" width="100">
        <template slot-scope="{row}">
          ¥{{ row.total_amount }}
        </template>
      </el-table-column>
      <el-table-column label="订单状态" align="center" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status | statusLabel }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="下单时间" align="center" width="160">
        <template slot-scope="{row}">
          <span>{{ row.created_at | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="{row}">
          <el-button size="mini" @click="handleDetail(row)">
            查看详情
          </el-button>
          <el-button 
            v-if="row.status === 1"
            size="mini" 
            type="success" 
            @click="handleShip(row)">
            发货
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- 订单详情对话框 -->
    <el-dialog title="订单详情" :visible.sync="dialogVisible" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ detail.order_no }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="detail.status | statusFilter">
            {{ detail.status | statusLabel }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="收货人">{{ detail.receiver_name }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detail.receiver_phone }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">{{ detail.receiver_address }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">¥{{ detail.total_amount }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ detail.created_at | parseTime }}</el-descriptions-item>
      </el-descriptions>

      <el-table :data="detail.goods" border style="margin-top: 20px">
        <el-table-column label="商品图片" width="100">
          <template slot-scope="{row}">
            <img :src="row.goods_image" style="width: 60px; height: 60px">
          </template>
        </el-table-column>
        <el-table-column label="商品名称" prop="goods_name" />
        <el-table-column label="单价" width="100">
          <template slot-scope="{row}">
            ¥{{ row.goods_price }}
          </template>
        </el-table-column>
        <el-table-column label="数量" prop="quantity" width="100" />
        <el-table-column label="小计" width="100">
          <template slot-scope="{row}">
            ¥{{ row.goods_price * row.quantity }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { getOrders, getOrderDetail, updateOrderStatus } from '@/api/order'
import Pagination from '@/components/Pagination'

export default {
  name: 'OrderList',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'info',
        1: 'warning',
        2: 'success',
        3: 'success'
      }
      return statusMap[status]
    },
    statusLabel(status) {
      const statusMap = {
        0: '待支付',
        1: '待发货',
        2: '已发货',
        3: '已完成'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        order_no: undefined,
        status: undefined
      },
      statusOptions: [
        { label: '待支付', value: 0 },
        { label: '待发货', value: 1 },
        { label: '已发货', value: 2 },
        { label: '已完成', value: 3 }
      ],
      dialogVisible: false,
      detail: {
        goods: []
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      try {
        const { data } = await getOrders(this.listQuery)
        this.list = data.list
        this.total = data.total
      } catch (error) {
        console.error('获取订单列表失败:', error)
      }
      this.listLoading = false
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    async handleDetail(row) {
      try {
        const { data } = await getOrderDetail(row.id)
        this.detail = data
        this.dialogVisible = true
      } catch (error) {
        console.error('获取订单详情失败:', error)
      }
    },
    async handleShip(row) {
      try {
        await this.$confirm('确认发货?', '提示', {
          type: 'warning'
        })
        await updateOrderStatus(row.id, 2)
        this.$message.success('发货成功')
        this.getList()
      } catch (error) {
        console.error('发货失败:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding-bottom: 10px;
  .filter-item {
    margin-right: 10px;
  }
}
</style> 