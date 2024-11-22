<template>
	<Menu></Menu>
	<RouterView />
	<Settings></Settings>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import Menu from "./common/components/layout/Menu.vue";
import Settings from "./common/components/layout/Settings.vue";
</script>

<style lang="scss" scoped></style>
