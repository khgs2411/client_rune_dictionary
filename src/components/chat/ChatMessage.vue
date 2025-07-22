<template>
	<template v-if="utils.guards.IsArray(content.message)">
		<div v-for="(item, index) in content.message" :key="index">
			<ChatMessage :message="item as WebsocketStructuredMessage" />
		</div>
	</template>
	<div v-else class="message" @contextmenu="onContextMenu" @click="onContextMenu">
		<span class="message-information">
			[{{ formattedTime }} - <span class="channel" :class="{ 'whisper-indicator': isWhisper, 'error-indicator': isErrorMessage }">{{ channel }}]</span>
		</span>
		<span class="sender" :class="{ 'system-indicator': isSystemMessage, 'error-indicator': isErrorMessage, 'generic-indicator': isGenericMessage, 'whisper-indicator': isWhisper }">{{ sender }}:</span>

		<span class="message-content" :class="{ 'whisper-indicator': isWhisper, 'error-indicator': isErrorMessage }">{{ content.message }}</span>

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
import Badge from "primevue/badge";
import ContextMenu from "primevue/contextmenu";
import { WebsocketEntityData, WebsocketStructuredMessage } from "topsyde-utils";
import { ref } from "vue";
import useUtils from "../../common/composables/useUtils";
import useWSM from "../../common/composables/useWSM";

const props = defineProps<{
	message: WebsocketStructuredMessage;
}>();

const emit = defineEmits<{
	(e: "action", action: { type: "whisper" | "match"; entity: WebsocketEntityData }): void;
}>();

const { channel, content, isSystemMessage, isErrorMessage, isGenericMessage, isWhisper, sender, formattedTime, client } = useWSM(props.message);
const utils = useUtils();
const wsm = useWSM(props.message);
const menu = ref();
const items = ref([
	{
		label: "Whisper",
		icon: "pi pi-comment",
		// shortcut: "⌘+W",

		command: () => onAction({ type: "whisper", entity: client.value }),
	},
	{
		label: "Match",
		icon: "pi pi-bolt",
		command: () => onAction({ type: "match", entity: client.value }),
	},
]);

function onAction(action: { type: "whisper" | "match"; entity: WebsocketEntityData }) {
	emit("action", action);
}

const onContextMenu = (event: MouseEvent) => {
	event.stopPropagation();
	event.preventDefault();
	if (wsm.isSystemMessage.value) return;
	menu.value.show(event);
};
</script>

<style lang="scss" scoped>
@use "../../assets/css/common.scss" as *;

.message {
	margin-bottom: 0.15rem;
	line-height: 1.2;
	cursor: pointer;
	display: flex;
	align-items: center;
	min-height: 18px;
	padding: 1px 0;
	gap: 3px;
}

.message-information {
	color: var(--p-text-color-secondary);
	font-size: 0.75rem;
	margin-right: 0;
	min-width: 125px;
	display: inline-flex;
	align-items: center;
	opacity: 0.75;
	font-family: "Consolas", monospace;

	.channel {
		margin-left: 3px;
		padding: 0 4px;
		border-radius: 2px;
		background: var(--p-content-background);
		font-weight: 500;
	}
}

.sender {
	color: var(--p-primary-color);
	font-weight: 500;
	margin-right: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 0.9rem;
}

.message-content {
	color: var(--p-text-color);
	flex: 1;
	word-break: break-word;
	font-size: 0.9rem;
	line-height: 1.3;
	padding-left: 1px;
	background: var(--p-content-background);
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
