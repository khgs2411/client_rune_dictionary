<template>
	<div class="message" @contextmenu="onRightClick">
		<span class="timestamp">[{{ formattedTime }} - {{ room }}]</span>
		<span class="sender" :class="{ 'system-indicator': isSystemMessage, 'error-indicator': isErrorMessage, 'generic-indicator': isGenericMessage }">{{ sender }}:</span>
		<span class="message-content">{{ content.message }}</span>

		<ContextMenu ref="menu" :model="items">
			<template #item="{ item, props }">
				<a v-ripple class="" v-bind="props.action">
					<span v-if="item.icon" :class="item.icon" />
					<span v-if="item.label" class="ml-2">{{ item.label }}</span>
					<Badge v-if="item.badge" class="ml-auto" :value="item.badge" />
					<span v-if="item.shortcut" class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">{{ item.shortcut }}</span>
					<i v-if="item.items" class="pi pi-angle-right ml-auto"></i>
				</a>
			</template>
		</ContextMenu>
	</div>
</template>

<script setup lang="ts">
import { WebsocketEntityData, WebsocketStructuredMessage } from "topsyde-utils";
import useWebsocketStructuredMessage from "../../common/composables/useWebsocketStructuredMessage";
import { ref } from "vue";
import ContextMenu from "primevue/contextmenu";
import Badge from "primevue/badge";

const props = defineProps<{
	message: WebsocketStructuredMessage;
}>();

const emit = defineEmits<{
	(e: "whisper", entity: WebsocketEntityData): void;
	(e: "match", entity: WebsocketEntityData): void;
}>();

const { room, content, isSystemMessage, isErrorMessage, isGenericMessage, sender, formattedTime, client } = useWebsocketStructuredMessage(props.message);
const wsm = useWebsocketStructuredMessage(props.message);
const menu = ref();
const items = ref([
	{
		label: "Whisper",
		icon: "pi pi-comment",
		// shortcut: "⌘+W",

		command: () => emit("whisper", client.value),
	},
	{
		label: "Match",
		icon: "pi pi-bolt",
		command: () => emit("match", client.value),
	},
]);

const onRightClick = (event: MouseEvent) => {
	event.stopPropagation();
	event.preventDefault();
	if (wsm.isSystemMessage.value) return;
	menu.value.show(event);
};
</script>

<style scoped>
.message {
	margin-bottom: 0.25rem;
	line-height: 1.2;
}

.timestamp {
	color: var(--p-text-color);
	font-size: 0.8rem;
	margin-right: 0.5rem;
}

.sender {
	color: var(--p-primary-color);
	font-weight: 500;
	margin-right: 0.5rem;
}

.system-indicator {
	color: var(--p-blue-500);
	font-weight: 500;
	margin-right: 0.5rem;
}

.error-indicator {
	color: var(--p-red-500);
	font-weight: 500;
	margin-right: 0.5rem;
}

.generic-indicator {
	color: var(--p-gray-500);
	font-weight: 500;
	margin-right: 0.5rem;
}

.message-content {
	color: var(--p-text-color);
}

.message.system .message-content {
	color: var(--p-blue-500);
	font-style: italic;
}

.message.error .message-content {
	color: var(--p-error-color);
}

.message.client\.connected .message-content,
.message.client\.join\.channel .message-content {
	color: var(--p-success-color);
	font-style: italic;
}
</style>
