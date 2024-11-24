<template>
    <div class="Layout">
		<Loading :loading="auth.loading.value"></Loading>
        <Menu></Menu>
        <Toast></Toast>
        <Settings></Settings>
    </div>
</template>

<script lang='ts' setup>
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';
import Menu from './Menu.vue';
import Settings from './Settings.vue';
import Toast from '../utilities/Toast.vue';
import Loading from '../utilities/Loading.vue';
import useAuth from '../../composables/useAuth';
const auth = useAuth();
</script>

<style lang="scss" scoped>
.Layout {}
</style>