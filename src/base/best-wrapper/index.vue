<template>
  <div class="outer-container" :style="{width:width,height:height}">
    <div class="inner-container">
      <slot></slot>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  props: {
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '0px'
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .outer-container
    position relative
    overflow hidden
  .inner-container
    width 100%
    left 0
    overflow-x hidden
    overflow-y scroll
  /* for Chrome */
  .inner-container::-webkit-scrollbar
    display none
</style>
