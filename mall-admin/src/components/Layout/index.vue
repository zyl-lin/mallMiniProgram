<template>
  <el-container class="app-wrapper">
    <el-aside :width="isCollapse ? '64px' : '200px'">
      <sidebar></sidebar>
    </el-aside>
    <el-container>
      <el-header>
        <navbar></navbar>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default {
  name: 'Layout',
  components: {
    Sidebar,
    Navbar
  },
  computed: {
    isCollapse() {
      return !this.$store.state.app.sidebar.opened
    }
  }
}
</script>

<style lang="scss" scoped>
.app-wrapper {
  height: 100vh;
  .el-aside {
    background-color: #304156;
    transition: width 0.3s;
    overflow: hidden;
    .sidebar-container {
      height: 100%;
    }
  }
  .el-header {
    background-color: #fff;
    border-bottom: 1px solid #dcdfe6;
    padding: 0;
    height: 50px;
  }
  .el-main {
    background-color: #f0f2f5;
    padding: 20px;
    overflow-y: auto;
  }
}
</style> 