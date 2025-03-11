<template>
  <div class="navbar">
    <div class="left-menu">
      <hamburger :is-active="sidebar.opened" @toggleClick="toggleSideBar" />
      <breadcrumb />
    </div>
    <div class="right-menu">
      <el-dropdown trigger="click">
        <span class="avatar-wrapper">
          <img src="@/assets/avatar.png" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'

export default {
  name: 'Navbar',
  components: {
    Breadcrumb,
    Hamburger
  },
  computed: {
    ...mapGetters([
      'sidebar'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;

  .left-menu {
    display: flex;
    align-items: center;
  }

  .right-menu {
    .avatar-wrapper {
      margin-left: 10px;
      cursor: pointer;
      
      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }

      .el-icon-caret-bottom {
        margin-left: 5px;
      }
    }
  }
}
</style> 