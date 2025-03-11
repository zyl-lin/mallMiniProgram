<template>
  <div class="sidebar-container">
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      :collapse="isCollapse"
      router>
      
      <el-menu-item index="/dashboard">
        <i class="el-icon-s-home"></i>
        <span slot="title">首页</span>
      </el-menu-item>

      <el-submenu index="/goods">
        <template slot="title">
          <i class="el-icon-goods"></i>
          <span>商品管理</span>
        </template>
        <el-menu-item index="/goods/list">商品列表</el-menu-item>
        <el-menu-item index="/goods/category">商品分类</el-menu-item>
      </el-submenu>

      <el-menu-item index="/order/list">
        <i class="el-icon-s-order"></i>
        <span slot="title">订单管理</span>
      </el-menu-item>

      <el-menu-item index="/banner">
        <i class="el-icon-picture"></i>
        <span slot="title">轮播图管理</span>
      </el-menu-item>

      <el-submenu index="/statistics">
        <template slot="title">
          <i class="el-icon-s-data"></i>
          <span>数据统计</span>
        </template>
        <el-menu-item index="/statistics/sales">销售统计</el-menu-item>
        <el-menu-item index="/statistics/orders">订单统计</el-menu-item>
      </el-submenu>

      <el-menu-item index="/system/admin">
        <i class="el-icon-setting"></i>
        <span slot="title">系统设置</span>
      </el-menu-item>
      
    </el-menu>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  computed: {
    activeMenu() {
      return this.$route.path
    },
    isCollapse() {
      return !this.$store.state.app.sidebar.opened
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebar-container {
  height: 100%;
  background-color: #304156;
}

.sidebar-menu {
  height: 100%;
  border: none;
  &:not(.el-menu--collapse) {
    width: 200px;
  }

  .el-menu-item, .el-submenu__title {
    &:hover {
      background-color: #263445 !important;
    }
  }
}
</style> 