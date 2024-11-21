<script setup lang="ts">
</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo"/>
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo secondary" alt="Vue logo"/>
    </a>
    <div class="logo">test</div>
  </div>
</template>

<style lang="scss" scoped>
@import "./assets/css/common.scss";
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em $primary);
}

.logo.secondary:hover {
  filter: drop-shadow(0 0 2em $secondary);
}
</style>
