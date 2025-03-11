<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button type="primary" @click="handleAdd">添加轮播图</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      style="width: 100%">
      <el-table-column
        prop="id"
        label="ID"
        width="80"
        align="center">
      </el-table-column>
      <el-table-column
        label="轮播图"
        width="200"
        align="center">
        <template slot-scope="scope">
          <img :src="scope.row.image_url" style="height: 80px;">
        </template>
      </el-table-column>
      <el-table-column
        prop="link_url"
        label="跳转链接">
      </el-table-column>
      <el-table-column
        prop="sort"
        label="排序"
        width="100"
        align="center">
      </el-table-column>
      <el-table-column
        label="状态"
        width="100"
        align="center">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="200"
        align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleEdit(scope.row)">编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑轮播图对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="轮播图" prop="image_url">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :show-file-list="false"
            :on-success="handleUploadSuccess">
            <img v-if="form.image_url" :src="form.image_url" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="跳转链接" prop="link_url">
          <el-input v-model="form.link_url"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0">
          </el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getBanners, addBanner, updateBanner, deleteBanner } from '@/api/banner'

export default {
  name: 'Banner',
  data() {
    return {
      list: [],
      listLoading: true,
      dialogVisible: false,
      dialogTitle: '',
      uploadUrl: process.env.VUE_APP_BASE_API + '/upload',
      form: {
        id: undefined,
        image_url: '',
        link_url: '',
        sort: 0,
        status: 1
      },
      rules: {
        image_url: [
          { required: true, message: '请上传轮播图', trigger: 'change' }
        ]
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
        const { data } = await getBanners()
        this.list = data
      } catch (error) {
        console.error('获取轮播图列表失败:', error)
      }
      this.listLoading = false
    },
    handleAdd() {
      this.dialogTitle = '添加轮播图'
      this.form = {
        image_url: '',
        link_url: '',
        sort: 0,
        status: 1
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑轮播图'
      this.form = Object.assign({}, row)
      this.dialogVisible = true
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该轮播图?', '提示', {
          type: 'warning'
        })
        await deleteBanner(row.id)
        this.$message.success('删除成功')
        this.getList()
      } catch (error) {
        console.error('删除轮播图失败:', error)
      }
    },
    async handleStatusChange(row) {
      try {
        await updateBanner({
          id: row.id,
          status: row.status
        })
        this.$message.success('更新成功')
      } catch (error) {
        console.error('更新状态失败:', error)
        row.status = row.status === 1 ? 0 : 1 // 恢复状态
      }
    },
    handleUploadSuccess(res) {
      this.form.image_url = res.url
    },
    async handleSubmit() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          try {
            if (this.form.id) {
              await updateBanner(this.form)
            } else {
              await addBanner(this.form)
            }
            this.$message.success('保存成功')
            this.dialogVisible = false
            this.getList()
          } catch (error) {
            console.error('保存轮播图失败:', error)
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &:hover {
    border-color: #409EFF;
  }
  
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
}
</style> 