<template>
	<div class="home">
        Hello World
    </div>
</template>

<script lang="ts" setup>
import { useColorMode } from "@vueuse/core";
import { defineComponent, ref, reactive, computed, onMounted } from "vue";
const colorMode = useColorMode()
</script>

<style lang="scss" scoped>
.home {
}
</style>
