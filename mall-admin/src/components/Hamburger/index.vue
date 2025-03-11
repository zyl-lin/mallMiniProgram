<template>
  <div style="padding: 0 15px;" @click="toggleClick">
    <i :class="{'el-icon-s-fold': isActive, 'el-icon-s-unfold': !isActive}" style="font-size: 20px;"/>
  </div>
</template>

<script>
export default {
  name: 'Hamburger',
  props: {
    isActive: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    toggleClick() {
      this.$emit('toggleClick')
    }
  }
}
</script>

<style scoped>
.hamburger {
  display: inline-block;
  cursor: pointer;
  width: 20px;
  height: 20px;
}
</style> 