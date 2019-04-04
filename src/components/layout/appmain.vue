<template>
  <section class="app-main">
    <transition name="fade" mode="out-in">
      <keep-alive :include="cachedViews">
        <router-view></router-view>
      </keep-alive>
    </transition>
  </section>
</template>

<script type="text/ecmascript-6">
export default {
  data() {
    return {
      cachedViews: ['monitor']
    }
  }
}
</script>
