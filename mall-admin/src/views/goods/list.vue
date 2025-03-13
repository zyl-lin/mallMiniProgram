<template>
  <div class="goods-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        placeholder="商品名称"
        style="width: 200px;"
        class="filter-item"
      />
      <el-select v-model="listQuery.status" placeholder="商品状态" clearable>
        <el-option label="上架" value="1" />
        <el-option label="下架" value="0" />
      </el-select>
      <el-button type="primary" @click="handleFilter">查询</el-button>
      <el-button type="success" @click="handleCreate">添加商品</el-button>
      <el-button type="warning" @click="handleBatchUpdateStatus(1)">批量上架</el-button>
      <el-button type="danger" @click="handleBatchUpdateStatus(0)">批量下架</el-button>
      <el-button type="primary" @click="handleBatchRecommend(1)">批量推荐</el-button>
      <el-button type="info" @click="handleBatchRecommend(0)">取消推荐</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="商品图片" width="110" align="center">
        <template slot-scope="scope">
          <img :src="scope.row.image_url" style="width: 60px; height: 60px">
        </template>
      </el-table-column>
      <el-table-column label="商品名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="价格" width="110" align="center">
        <template slot-scope="scope">
          ¥{{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column label="库存" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.stock }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">
            {{ scope.row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="推荐" width="110" align="center">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.is_recommend"
            :active-value="1"
            :inactive-value="0"
            @change="handleRecommendChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.row)">删除</el-button>
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
  </div>
</template>

<script>
import { getGoodsList, batchUpdateStatus, updateGoodsRecommend, batchUpdateRecommend } from '@/api/goods'

export default {
  name: 'GoodsList',
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        status: undefined
      },
      multipleSelection: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      try {
        const { data } = await getGoodsList(this.listQuery)
        this.list = data.list
        this.total = data.total
      } catch (error) {
        console.error('获取商品列表失败:', error)
      }
      this.listLoading = false
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleCreate() {
      this.$router.push('/goods/edit')
    },
    handleUpdate(row) {
      this.$router.push(`/goods/edit/${row.id}`)
    },
    handleDelete(row) {
      // TODO: 调用删除商品API
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    async handleBatchUpdateStatus(status) {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请先选择商品');
        return;
      }
      
      try {
        await this.$confirm(`确认${status === 1 ? '上架' : '下架'}选中的商品吗?`, '提示', {
          type: 'warning'
        });
        
        const ids = this.multipleSelection.map(item => item.id);
        await batchUpdateStatus({ ids, status });
        this.$message.success('操作成功');
        this.getList();
      } catch (error) {
        console.error('操作失败:', error);
      }
    },
    async handleRecommendChange(row) {
      try {
        console.log('更新推荐状态请求数据:', {
          id: row.id,
          is_recommend: row.is_recommend
        });
        const res = await updateGoodsRecommend({
          id: row.id,
          is_recommend: row.is_recommend
        });
        console.log('更新推荐状态响应:', res);
        this.$message.success('更新成功');
        this.getList();
      } catch (error) {
        console.error('更新推荐状态失败:', error);
        row.is_recommend = !row.is_recommend;
        this.$message.error('更新失败');
      }
    },
    async handleBatchRecommend(is_recommend) {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请先选择商品')
        return
      }

      try {
        await this.$confirm(`确认${is_recommend ? '推荐' : '取消推荐'}选中的商品吗?`, '提示', {
          type: 'warning'
        })
        
        const ids = this.multipleSelection.map(item => item.id)
        await batchUpdateRecommend({ ids, is_recommend })
        this.$message.success('操作成功')
        this.getList()
      } catch (error) {
        console.error('批量更新推荐状态失败:', error)
      }
    }
  }
}
</script> 