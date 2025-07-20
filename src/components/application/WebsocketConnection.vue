<template>
	<div class="websocket-connection-interface">
		<template v-if="isChatReady">
			<div v-if="auth$.loading.value" class="loading-container">
				<div class="loading-spinner"></div>
				<p>Connecting to chat server...</p>
			</div>
			<Chat :ws="ws" :messages="messages" :container-ref="containerRef" v-else-if="auth$.client.value"
				:client="auth$.client.value!" @logout="auth$.logout()" />
		</template>
		<div v-else-if="errorMessage" class="chat-error-message">{{ errorMessage }}</div>
	</div>
</template>

<script lang="ts" setup>
	import { useWebSocket } from "@vueuse/core";
import { WebsocketStructuredMessage } from "topsyde-utils";
import { computed, PropType, ref, watch } from "vue";
import useAuth from "../../common/composables/useAuth";
import useWebsocketEmitter from "../../common/composables/useWebsocketEmitter";
import useWebSocketInterface, { WEBSOCKET_HOST } from "../../common/composables/useWebsocketInterface";
import Chat from "../chat/Chat.vue";
	defineProps({
		containerRef: {
			type: [Object, null] as PropType<HTMLElement | null>,
			required: true,
		},
	});

	const auth$ = useAuth();

	const errorMessage = ref("");

	const isChatReady = computed(() => auth$.authorized.value && !!auth$.client.value);
	const messages = ref<WebsocketStructuredMessage[]>([]);


	const wsOptions = useWebSocketInterface(ref(auth$.client.value!), messages);
	const ws = useWebSocket<WebsocketStructuredMessage>(WEBSOCKET_HOST, wsOptions);
	useWebsocketEmitter(ws);

	watch(
		() => [auth$.authorized.value, auth$.client.value],
		([authorized, client]) => {
			if (authorized && !client) {
				errorMessage.value = "Your chat session expired or failed to connect. Please log in again.";
				auth$.logout();
			}
		},
		{ immediate: true }
	);

</script>

<style lang="scss" scoped>
	.chat-error-message {
		color: var(--p-red-500);
		background: var(--p-content-background);
		padding: 1rem;
		margin-bottom: 1rem;
		border-radius: 4px;
		text-align: center;
	}
</style>
