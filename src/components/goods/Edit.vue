<template>
  <div>
    <!-- 面包屑导航区域 -->
    <breadcrumb></breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert
        title="编辑商品信息"
        type="info"
        center
        show-icon
        :closable="false">
      </el-alert>
      <el-steps :space="200" :active="+activeIndex" finish-status="success" align-center>
        <el-step title="商品信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" label-position="top">
        <el-tabs :tab-position="'left'" v-model="activeIndex" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="editForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="editForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="editForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="editForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="editForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                disabled></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyTableData" :label="item.attr_name" :key="item.attr_id">
                <el-checkbox-group v-model="item.attr_vals">
                  <el-checkbox v-for="(cb, i) in item.attr_vals" :label="cb" :key="i" border></el-checkbox>
                </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTableData" :label="item.attr_name" prop="goods_weight" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片要上传到的后台API地址 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :file-list="fileList"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor
              ref="myQuillEditor"
              v-model="editForm.goods_introduce"
            />
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="edit">提交修改</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog title="提示" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
import Breadcrumb from '@/components/Breadcrumb.vue'
export default {
  components: {
    Breadcrumb
  },
  data() {
    return {
      activeIndex: '0',
      // 添加商品的表单数据对象
      editForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        attrs: []
      },
      editFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      cateList: [],
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 上传图片的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      previewVisible: false,
      fileList: []
    }
  },
  created() {
    this.getCateList()
    this.getGoodsInfo()
  },
  methods: {
    // 获取将要修改的商品信息
    async getGoodsInfo() {
      const { data: res } = await this.$http.get(`goods/${this.$route.params.id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品信息失败！')
      }

      this.editForm = res.data
      this.editForm.goods_cat = [this.editForm.cat_one_id, this.editForm.cat_two_id, this.editForm.cat_three_id]
      this.editForm.pics.forEach(item => {
        this.fileList.push({
          name: item.goods_id,
          url: item.pics_sma_url
        })
      })
    },
    // 获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败！')
      }
      this.cateList = res.data
    },
    async tabClicked() {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'many'
          }
        })

        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败!')
        }

        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
        console.log(this.manyTableData)
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'only'
          }
        })

        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性失败!')
        }

        this.onlyTableData = res.data
        console.log(this.onlyTableData)
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 处理移除图片的操作
    handleRemove(file) {
      console.log(file)
      // 1.获取将要删除的图片临时路径
      const filePath = file.response.data.tmp_path
      // 2.从 pics 数组中，找到图片对应的索引值
      const i = this.editForm.pics.findIndex(x => x.pic === filePath)
      // 3.调用数组的 splice 方法，把图片信息对象, 从 pics 数组中移除
      this.editForm.pics.splice(i, 1)
      console.log(this.editForm)
    },
    // 监听图片上传成功的事件
    handleSuccess(res) {
      // 1.拼接得到一个图片信息对象
      const picInfo = {
        pic: res.data.tmp_path
      }
      // 2.将图片信息对象，push到pics数组中
      this.editForm.pics.push(picInfo)
      console.log(this.editForm)
    },
    edit() {
      console.log(this.editForm)
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        // 执行添加的业务逻辑
        const form = _.cloneDeep(this.editForm)
        form.goods_cat = form.goods_cat.join(',')

        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }
          this.editForm.attrs.push(newInfo)
        })

        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.editForm.attrs.push(newInfo)
        })
        console.log(this.editForm.attrs)
        form.attrs = this.editForm.attrs
        const { data: res } = await this.$http.put(`goods/${this.editForm.goods_id}`, form)
        if (res.meta.status !== 200) {
          return this.$message.error('修改商品失败！')
        }

        this.$message.success('修改商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      if (this.editForm.goods_cat.length === 3) {
        return this.editForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
  .el-checkbox {
    margin: 0 5px 0 0 !important;
  }
  .previewImg {
    width: 100%;
  }
  .btnAdd {
    margin-top: 15px;
  }
</style>
