<template>
  <div>
    <breadcrumb></breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table class="treeTable"
        :data="cateList"
        :columns="columns"
        :show-index="true"
        :selection-type="false"
        :expand-type="false"
        :show-row-hover="false"
        border>
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i :class="[!scope.row.cat_deleted ? 'el-icon-success' : 'el-icon-error']"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success" size="mini">二级</el-tag>
          <el-tag v-else type="warning" size="mini">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template  slot="opt">
          <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      :visible.sync="addCateDialogVisble"
      width="50%"
      @close="addCateDialogClosed">
      <el-form ref="addCateFormRef" :model="addCateForm" :rules="addCateFormRules" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!--
            options 用来指定数据源
            props 用来指定配置对象
           -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisble = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb.vue'
export default {
  components: {
    Breadcrumb
  },
  data() {
    return {
      // 查询商品分类列表条件
      queryInfo: {
        // 值：1，2，3 分别表示显示一层二层三层分类列表
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      cateList: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [{
        label: '分类名称',
        prop: 'cat_name',
        width: ''
      }, {
        label: '是否有效',
        // 表示当前列定位为模板列
        type: 'template',
        // 表示当前这一列使用模板名称
        template: 'isok'
      }, {
        label: '排序',
        type: 'template',
        template: 'order'
      }, {
        label: '操作',
        type: 'template',
        template: 'opt'
      }],
      addCateDialogVisble: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 父级分类的id
        cat_pid: 0,
        // 将要添加的分类名称
        cat_name: '',
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [{
          required: true,
          message: '请输入分类名称',
          trigger: 'blur'
        }]
      },
      // 父级分类的列表
      parentCateList: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 选中的父级分类id数组
      selectedKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听 pagesize 改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum 改变
    handleCurrentChange(currentPage) {
      this.queryInfo.pagenum = currentPage
      this.getCateList()
    },
    // 显示添加分类的对话框
    showAddCateDialog() {
      this.getParentCateList()
      this.addCateDialogVisble = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      this.parentCateList = res.data
    },
    // 选中项发生变化触发这个函数
    parentCateChanged() {
      // 如果 selectedkeys 数组中的 length 大于0，证明选中了父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return false
      } else {
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 添加新分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.post('categories', this.addCateForm)

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败!')
        }

        this.$message.success('添加分类成功!')
        this.getCateList()
        this.addCateDialogVisble = false
      })
      console.log(this.addCateForm)
    },
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    }
  }
}
</script>

<style lang="less" scoped>
  .treeTable {
    margin-top: 20px;
  }
  .el-icon-success {
    color: lightgreen;
  }
  .el-icon-error {
    color: red;
  }
  .el-cascader {
    width: 100%;
  }
</style>
