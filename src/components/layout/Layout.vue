<template>
    <div class="Layout">
		<Loading :loading="auth.loading.value"></Loading>
        <Menu></Menu>
        <Toast></Toast>
        <Settings></Settings>
    </div>
</template>

<script lang='ts' setup>
import useAuth from '../../common/composables/useAuth';
import Loading from '../utilities/Loading.vue';
import Toast from '../utilities/Toast.vue';
import Menu from './Menu.vue';
import Settings from './Settings.vue';
const auth = useAuth();
</script>

<style lang="scss" scoped>
.Layout {}
</style>