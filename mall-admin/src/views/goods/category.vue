<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button type="primary" @click="handleAdd">添加分类</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      style="width: 100%">
      <el-table-column
        prop="id"
        label="ID"
        width="80">
      </el-table-column>
      <el-table-column
        prop="name"
        label="分类名称">
      </el-table-column>
      <el-table-column
        label="分类图片"
        width="120">
        <template slot-scope="scope">
          <img :src="scope.row.image_url" style="width: 60px; height: 60px">
        </template>
      </el-table-column>
      <el-table-column
        prop="sort"
        label="排序"
        width="100">
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

    <!-- 添加/编辑分类对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="分类图片" prop="image_url">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :show-file-list="false"
            :on-success="handleUploadSuccess">
            <img v-if="form.image_url" :src="form.image_url" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0"></el-input-number>
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
import { getCategories, addCategory, updateCategory, deleteCategory } from '@/api/category'

export default {
  name: 'Category',
  data() {
    return {
      list: [],
      listLoading: true,
      dialogVisible: false,
      dialogTitle: '',
      uploadUrl: process.env.VUE_APP_BASE_API + '/upload',
      form: {
        id: undefined,
        name: '',
        image_url: '',
        sort: 0
      },
      rules: {
        name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
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
        const { data } = await getCategories()
        this.list = data
      } catch (error) {
        console.error('获取分类列表失败:', error)
      }
      this.listLoading = false
    },
    handleAdd() {
      this.dialogTitle = '添加分类'
      this.form = {
        name: '',
        image_url: '',
        sort: 0
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑分类'
      this.form = Object.assign({}, row)
      this.dialogVisible = true
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该分类?', '提示', {
          type: 'warning'
        })
        await deleteCategory(row.id)
        this.$message.success('删除成功')
        this.getList()
      } catch (error) {
        console.error('删除分类失败:', error)
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
              await updateCategory(this.form)
            } else {
              await addCategory(this.form)
            }
            this.$message.success('保存成功')
            this.dialogVisible = false
            this.getList()
          } catch (error) {
            console.error('保存分类失败:', error)
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style> 