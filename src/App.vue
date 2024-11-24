<template>
	<Layout />
	<RouterView />
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import Layout from "./common/components/layout/Layout.vue";
</script>

<style lang="scss" scoped></style>
