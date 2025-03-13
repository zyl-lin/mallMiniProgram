<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="商品名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入商品名称"/>
      </el-form-item>

      <el-form-item label="商品分类" prop="category_id">
        <el-select v-model="form.category_id" placeholder="请选择商品分类">
          <el-option
            v-for="item in categories"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="商品价格" prop="price">
        <el-input-number 
          v-model="form.price" 
          :precision="2" 
          :step="0.1" 
          :min="0"
        />
      </el-form-item>

      <el-form-item label="商品库存" prop="stock">
        <el-input-number 
          v-model="form.stock" 
          :min="0" 
          :step="1"
        />
      </el-form-item>

      <el-form-item label="商品主图" prop="image_url">
        <el-upload
          class="avatar-uploader"
          :action="uploadUrl"
          :show-file-list="false"
          :on-success="handleUploadSuccess"
          :before-upload="beforeUpload">
          <img v-if="form.image_url" :src="form.image_url" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>

      <el-form-item label="商品详情" prop="detail">
        <div style="border: 1px solid #ccc">
          <Toolbar
            :editor="editor"
            :defaultConfig="{}"
            style="border-bottom: 1px solid #ccc"
          />
          <Editor
            v-model="form.detail"
            :defaultConfig="editorConfig"
            style="height: 500px; overflow-y: hidden;"
            @onCreated="handleEditorCreated"
          />
        </div>
      </el-form-item>

      <el-form-item label="上架状态" prop="status">
        <el-switch
          v-model="form.status"
          :active-value="1"
          :inactive-value="0"
        />
      </el-form-item>

      <el-form-item label="推荐商品" prop="is_recommend">
        <el-switch
          v-model="form.is_recommend"
          :active-value="1"
          :inactive-value="0"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
        <el-button @click="$router.back()">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { addGoods, updateGoods, getGoodsDetail } from '@/api/goods'
import { getCategoryList } from '@/api/category'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'

export default {
  name: 'GoodsEdit',
  components: { Editor, Toolbar },
  data() {
    return {
      form: {
        name: '',
        category_id: undefined,
        price: 0,
        stock: 0,
        image_url: '',
        detail: '',
        status: 1,
        is_recommend: 0
      },
      rules: {
        name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        category_id: [
          { required: true, message: '请选择商品分类', trigger: 'change' }
        ],
        price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        stock: [
          { required: true, message: '请输入商品库存', trigger: 'blur' }
        ],
        image_url: [
          { required: true, message: '请上传商品主图', trigger: 'change' }
        ]
      },
      categories: [],
      uploadUrl: '/api/admin/goods/upload-image',
      editor: null,
      editorConfig: {
        placeholder: '请输入商品详情',
        MENU_CONF: {
          uploadImage: {
            server: '/api/admin/goods/upload-image',
            fieldName: 'file',
            maxFileSize: 5 * 1024 * 1024, // 5MB
            maxNumberOfFiles: 5,
            allowedFileTypes: ['image/jpeg', 'image/png'],
            headers: {
              'Authorization': `Bearer ${this.$store.getters.token}`
            },
            customInsert(res, insertFn) {
              if (res.code === 0) {
                insertFn(res.data.url)
              } else {
                throw new Error(res.message || '上传失败')
              }
            },
            onFailed(file, res) {
              console.error('图片上传失败', res)
              throw new Error('上传失败')
            },
            onError(file, err, res) {
              console.error('图片上传出错', err, res)
              throw new Error('上传出错')
            }
          }
        }
      }
    }
  },
  created() {
    this.getCategories()
    const id = this.$route.params.id
    if (id) {
      this.getDetail(id)
    }
  },
  methods: {
    async getCategories() {
      try {
        const { data } = await getCategoryList()
        if (Array.isArray(data)) {
          this.categories = data
        } else {
          console.error('获取分类列表数据格式错误:', data)
          this.$message.error('获取分类列表失败')
        }
      } catch (error) {
        console.error('获取分类列表失败:', error)
        this.$message.error('获取分类列表失败')
      }
    },
    async getDetail(id) {
      try {
        const { data } = await getGoodsDetail(id)
        this.form = data
      } catch (error) {
        console.error('获取商品详情失败:', error)
      }
    },
    handleUploadSuccess(res) {
      if (res.code === 0) {
        this.form.image_url = res.data.url
        this.$message.success('上传成功')
      } else {
        this.$message.error(res.message || '上传失败')
      }
    },
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        this.$message.error('只能上传图片文件!')
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB!')
      }
      return isImage && isLt2M
    },
    handleEditorCreated(editor) {
      this.editor = editor
    },
    beforeDestroy() {
      if (this.editor) {
        this.editor.destroy()
      }
    },
    async handleSubmit() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          try {
            console.log('提交数据:', this.form);
            const formData = {
              ...this.form,
              is_recommend: this.form.is_recommend ? 1 : 0
            };
            if (this.form.id) {
              const res = await updateGoods(formData);
              console.log('更新结果:', res);
            } else {
              const res = await addGoods(formData);
              console.log('添加结果:', res);
            }
            this.$message.success('保存成功');
            this.$router.push('/goods/list');
          } catch (error) {
            console.error('保存商品失败:', error);
            this.$message.error('保存失败');
          }
        }
      });
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
  width: 178px;
  height: 178px;
}
.avatar-uploader:hover {
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
</style> 