<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button type="primary" @click="handleAdd">添加轮播图</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="加载中..."
      border
      fit
      highlight-current-row
      style="width: 100%">
      <el-table-column label="ID" prop="id" align="center" width="80" />
      <el-table-column label="图片" width="200" align="center">
        <template slot-scope="{row}">
          <img :src="row.image_url" style="height: 80px;">
        </template>
      </el-table-column>
      <el-table-column label="链接" prop="link_url" />
      <el-table-column label="排序" prop="sort" width="100" align="center" />
      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="{row}">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="{row}">
          <el-button size="mini" @click="handleEdit(row)">编辑</el-button>
          <el-button 
            size="mini" 
            type="danger" 
            @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="图片" prop="image_url">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :show-file-list="false"
            :headers="uploadHeaders"
            :before-upload="beforeUpload"
            :on-error="handleUploadError"
            :on-success="handleUploadSuccess">
            <img v-if="form.image_url" :src="form.image_url" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="链接" prop="link_url">
          <el-input v-model="form.link_url" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getBannerList, addBanner, updateBanner, deleteBanner, updateBannerStatus } from '@/api/banner'

export default {
  name: 'Banner',
  beforeCreate() {
    console.log('轮播图组件 beforeCreate')
  },
  data() {
    return {
      list: [],
      listLoading: true,
      dialogVisible: false,
      dialogTitle: '',
      uploadUrl: '/api/admin/goods/upload-image',
      uploadHeaders: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
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
        ],
        link_url: [
          { required: true, message: '请输入链接地址', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    console.log('轮播图组件 created')
    this.getList()
  },
  mounted() {
    console.log('轮播图组件 mounted')
  },
  methods: {
    async getList() {
      console.log('轮播图组件 getList 方法调用')
      this.listLoading = true
      try {
        const { data } = await getBannerList()
        console.log('轮播图列表数据:', data)
        this.list = data
      } catch (error) {
        console.error('轮播图列表获取失败:', error.message || error)
        this.$message.error('获取轮播图列表失败')
      } finally {
        this.listLoading = false
      }
    },
    handleAdd() {
      console.log('点击添加轮播图')
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
      console.log('点击编辑轮播图:', row)
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
        this.$message.error('删除轮播图失败')
      }
    },
    async handleStatusChange(row) {
      try {
        await updateBannerStatus({
          id: row.id,
          status: row.status
        })
        this.$message.success('状态更新成功')
      } catch (error) {
        console.error('更新状态失败:', error)
        this.$message.error('更新状态失败')
        row.status = row.status === 1 ? 0 : 1 // 恢复状态
      }
    },
    beforeUpload(file) {
      console.log('准备上传文件:', file.name, file.type, file.size)
      const isImage = file.type.startsWith('image/');
      const isLt5M = file.size / 1024 / 1024 < 5;

      if (!isImage) {
        this.$message.error('只能上传图片文件!');
        return false;
      }
      if (!isLt5M) {
        this.$message.error('图片大小不能超过 5MB!');
        return false;
      }
      return true;
    },
    handleUploadError(err, file) {
      console.error('文件上传失败:', err)
      this.$message.error(`文件 ${file.name} 上传失败: ${err.message || '未知错误'}`)
    },
    handleUploadSuccess(res) {
      console.log('上传响应:', res)
      if (res.code === 0) {
        this.form.image_url = res.data.url // 使用完整的URL路径
        this.$message.success('上传成功')
      } else {
        this.$message.error(res.msg || '上传失败')
      }
    },
    async handleSubmit() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          try {
            if (this.form.id) {
              await updateBanner(this.form)
            } else {
              await addBanner({
                image_url: this.form.image_url,
                link_url: this.form.link_url || '',
                sort: this.form.sort || 0,
                status: this.form.status || 1
              })
            }
            this.$message.success('保存成功')
            this.dialogVisible = false
            this.getList()
          } catch (error) {
            console.error('保存轮播图失败:', error)
            this.$message.error('保存失败')
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding-bottom: 10px;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &:hover {
    border-color: #409EFF;
  }
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
</style> 