<template>
	<Sheet v-model:open="isOpen">
		<TooltipProvider :delay-duration="0">
			<Tooltip>
				<TooltipTrigger as-child>
					<SheetTrigger as-child>
						<slot name="trigger">
							<Button variant="ghost" size="icon" class="h-8 w-8">
								<Settings class="h-4 w-4" />
							</Button>
						</slot>
					</SheetTrigger>
				</TooltipTrigger>
				<TooltipContent>
					<p>Application Settings</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
		<SheetContent @wheel.stop>
			<SheetHeader>
				<SheetTitle class="text-primary">Settings</SheetTitle>
				<SheetDescription> Customize your game settings </SheetDescription>
			</SheetHeader>

			<div class="py-4 space-y-6">
				<!-- Appearance Section -->
				<div class="space-y-3">
					<h3 class="text-sm font-semibold text-primary">Appearance</h3>

					<!-- Dark/Light Mode Toggle -->
					<div class="space-y-2">
						<label class="text-xs text-muted-foreground">Mode</label>
						<Button @click="settings.toggleColorMode()" variant="outline" size="sm" class="w-full">
							<Moon v-if="settings.theme.colorMode === 'dark'" class="h-4 w-4 mr-2" />
							<Sun v-else class="h-4 w-4 mr-2" />
							{{ settings.theme.colorMode === "dark" ? "Dark Mode" : "Light Mode" }}
						</Button>
					</div>
				</div>

				<!-- Debug Settings Section -->
				<div v-if="auth.isAuthenticated" class="pt-4 border-t border-border space-y-3">
					<h3 class="text-sm font-semibold text-primary">Debug Tools</h3>

					<TooltipProvider :delay-duration="0">
						<Tooltip>
							<TooltipTrigger as-child>
								<div class="flex items-center justify-between py-1">
									<div class="flex flex-col">
										<span class="text-sm font-medium">Console Logs</span>
										<span class="text-xs text-muted-foreground">Enable/disable console output</span>
									</div>
									<Switch v-model="settings.debug.enableConsoleLog" />
								</div>
							</TooltipTrigger>
							<TooltipContent side="left">
								<p>Enable or disable console logging</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<TooltipProvider :delay-duration="0">
						<Tooltip>
							<TooltipTrigger as-child>
								<div class="flex items-center justify-between py-1">
									<div class="flex flex-col">
										<span class="text-sm font-medium">Performance Stats</span>
										<span class="text-xs text-muted-foreground">FPS, frame time, memory</span>
									</div>
									<Switch v-model="settings.debug.showStats" />
								</div>
							</TooltipTrigger>
							<TooltipContent side="left">
								<p>Display Three.js performance overlay</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<TooltipProvider :delay-duration="0">
						<Tooltip>
							<TooltipTrigger as-child>
								<div class="flex items-center justify-between py-1">
									<div class="flex flex-col">
										<span class="text-sm font-medium">WebSocket Debugger</span>
										<span class="text-xs text-muted-foreground">Real-time event monitor</span>
									</div>
									<Switch v-model="settings.debug.showWebSocketDebugger" />
								</div>
							</TooltipTrigger>
							<TooltipContent side="left">
								<p>Show live WebSocket event stream</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<TooltipProvider :delay-duration="0">
						<Tooltip>
							<TooltipTrigger as-child>
								<div class="flex items-center justify-between py-1">
									<div class="flex flex-col">
										<span class="text-sm font-medium">Physics Debug</span>
										<span class="text-xs text-muted-foreground">Show collider wireframes</span>
									</div>
									<Switch v-model="settings.debug.showPhysicsDebug" />
								</div>
							</TooltipTrigger>
							<TooltipContent side="left">
								<p>Show green wireframes around all physics colliders</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<TooltipProvider :delay-duration="0">
						<Tooltip>
							<TooltipTrigger as-child>
								<div class="flex items-center justify-between py-1">
									<div class="flex flex-col">
										<span class="text-sm font-medium">Auto Match</span>
										<span class="text-xs text-muted-foreground">Start PvE match on reload</span>
									</div>
									<Switch v-model="settings.debug.autoMatch" />
								</div>
							</TooltipTrigger>
							<TooltipContent side="left">
								<p>Automatically start match with Training Dummy on HMR reload</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<TooltipProvider :delay-duration="0">
						<Tooltip>
							<TooltipTrigger as-child>
								<div class="flex items-center justify-between py-1">
									<div class="flex flex-col">
										<span class="text-sm font-medium">Admin Panel</span>
										<span class="text-xs text-muted-foreground">CRUD for Runes & Aspects</span>
									</div>
									<Switch v-model="settings.debug.showAdminPanel" />
								</div>
							</TooltipTrigger>
							<TooltipContent side="left">
								<p>Open the Admin Panel to manage game data</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>

				<!-- Logout Button -->
				<div v-if="showLogout" class="pt-4 border-t border-border">
					<Button @click="handleLogout" variant="destructive" size="sm" class="w-full text-destructive-foreground">
						<LogOut class="h-4 w-4 mr-2" />
						Logout
					</Button>
				</div>
			</div>
		</SheetContent>
	</Sheet>
</template>

<script setup lang="ts">
import { Settings, Sun, Moon, LogOut } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Button from "@/components/ui/button/Button.vue";
import Switch from "@/components/ui/switch/Switch.vue";
import { useSettingsStore } from "@/stores/settings.store";
import { useAuthStore } from "@/stores/auth.store";
import { computed, ref } from "vue";

const settings = useSettingsStore();
const auth = useAuthStore();
const router = useRouter();

const isOpen = ref(false);

function handleLogout() {
	console.log("👋 Logging out...");
	isOpen.value = false; // Close the sheet
	auth.logout(); // Clear auth tokens with TTL
	router.push({ name: "login" });
}

const showLogout = computed(() => router.currentRoute.value.name !== "login");
</script>
