<template>
    <el-container class="home-contianer">
      <!-- 头部 -->
      <el-header>
        <div>
          电商后台管理系统
        </div>
        <el-button type="info" @click="loginOut">退出</el-button>
      </el-header>
      <!-- 页面主体 -->
      <el-container>
        <!-- 侧边栏 -->
        <el-aside ref="asideRef" :width="isCollapse ? '64px':'200px'">
          <div class="toggle-button" @click="toggleMenu">|||</div>
          <el-menu
            background-color="#333744"
            text-color="#fff"
            active-text-color="#409EFF"
            unique-opened
            :collapse-transition="false"
            :collapse="isCollapse"
            :router="true"
            :default-active="activePath">
            <!-- 一级菜单 -->
              <el-submenu v-for="item in menuList" :key="item.id" :index="item.id + ''">
                <template slot="title">
                  <i :class="iconObj[item.id]"></i>
                  <span>{{item.authName}}</span>
                </template>
                <!-- 二级菜单 -->
                <el-menu-item
                  v-for="subItem in item.children"
                  :index="subItem.path + ''"
                  :key="subItem.id"
                  @click="saveNavState(subItem.path)">
                  <template slot="title">
                    <i class="el-icon-menu"></i>
                    <span>{{subItem.authName}}</span>
                  </template>
                </el-menu-item>
              </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 右侧内容 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      iconObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  created() {
    this.activePath = window.sessionStorage.getItem('activePath')
    this.getMenuList()
  },
  methods: {
    loginOut() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    toggleMenu() {
      this.isCollapse = !this.isCollapse
      // this.asideCollapse = !this.asideCollapse
    },
    saveNavState(index) {
      window.sessionStorage.setItem('activePath', index)
      this.activePath = index
    }
  }
}
</script>

<style lang="less" scoped>
.home-contianer {
  height: 100%;
}

.el-header {
  padding-left: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #373d41;
  color: #fff;
  font-size: 22px;
  img {
    width: 60px;
    height: 100%
  }
}

.el-aside {
  height: 100%;
  background-color: #333744;
  .el-menu {
    border-right: none;
}

.el-submenu__title span,
  .el-menu-item {
    font-size: 13px !important;
  }
}

.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}

.toggle-button {
  text-align: center;
  line-height: 25px;
  color: #fff;
  font-size: 12px;
  letter-spacing: 0.1em;
  background-color: #4a5064;
  cursor: pointer;
}

</style>
