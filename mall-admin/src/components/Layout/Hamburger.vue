<template>
  <div class="hamburger" @click="toggleClick">
    <i :class="{'is-active':isActive}" class="el-icon-s-fold"/>
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
      this.$emit('toggle')
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
  transform: rotate(90deg);
  transition: .38s;
  transform-origin: 50% 50%;
}
.hamburger.is-active {
  transform: rotate(0deg);
}
</style> 