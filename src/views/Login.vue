<template>
	<div class="card flex justify-center gap">
		<InputText v-model="username"></InputText>
		<InputText v-model="password"></InputText>
		<Button label="Verify" @click="login" />
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { InputText } from "primevue";
import Button from "primevue/button";
import { useRouter } from "vue-router";
import AuthAPI from "../common/api/auth.api";
import { useAuthStore } from "../stores/auth.store";
import { useMiscStore } from "../stores/misc.store";

const api = new AuthAPI("main");
const store = useAuthStore();
const misc = useMiscStore();
const router = useRouter();
const { username, password, loading } = storeToRefs(store);
async function login() {
	try {
		loading.value = true;
		const res = await api.login(username.value, password.value);
		store.setAuthorized(res.authorized);
		misc.toast({ msg: "Logged in succesfully! Redirecting", position: "center", severity: "info", duration:1000 });
		router.push("/app");
		setTimeout(()=>{
			loading.value = false
		}, 1001)
	} catch (e) {
		misc.toast({ msg: "Failed to login", position: "center", severity: "error" });
	}
}

</script>

<style scoped lang="scss"></style>
