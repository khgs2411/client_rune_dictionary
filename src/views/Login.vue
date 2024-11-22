<template>
	<div class="card flex justify-center">
		<InputText v-model="username"></InputText>
		<InputText v-model="api_key"></InputText>
		<Button label="Verify" @click="login" />
	</div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import { InputText } from "primevue";
import { ref } from "vue";
import AuthAPI from "../common/api/auth.api";

const api = new AuthAPI("main");

const username = ref("");
const api_key = ref("");

async function login() {
	try {
		const res = await api.login(username.value, api_key.value);
		console.log(res);
	} catch (e) {
		console.log(e);
	}
}
</script>

<style scoped lang="scss"></style>
