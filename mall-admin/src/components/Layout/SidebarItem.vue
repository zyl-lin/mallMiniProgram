<template>
  <div>
    <template v-if="!item.hidden">
      <template v-if="!item.children">
        <el-menu-item :index="item.path">
          <i :class="item.meta.icon"></i>
          <span slot="title">{{ item.meta.title }}</span>
        </el-menu-item>
      </template>

      <el-submenu v-else :index="item.path">
        <template slot="title">
          <i :class="item.meta.icon"></i>
          <span>{{ item.meta.title }}</span>
        </template>
        <sidebar-item
          v-for="child in item.children"
          :key="child.path"
          :item="child"
        />
      </el-submenu>
    </template>
  </div>
</template>

<script>
export default {
  name: 'SidebarItem',
  props: {
    item: {
      type: Object,
      required: true
    }
  }
}
</script> 