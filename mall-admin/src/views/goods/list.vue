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
      <el-button type="primary" @click="handleCreate">添加商品</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
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
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      // TODO: 调用获取商品列表API
      setTimeout(() => {
        this.listLoading = false
      }, 1000)
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleCreate() {
      // TODO: 跳转到商品创建页面
    },
    handleUpdate(row) {
      // TODO: 跳转到商品编辑页面
    },
    handleDelete(row) {
      // TODO: 调用删除商品API
    }
  }
}
</script> 