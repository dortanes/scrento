<script setup lang="ts">
	import {Ref, onMounted, ref} from "vue";
	import {ipcRenderer} from "electron";
	import DevicePreviewCard from "./DevicePreviewCard.vue";
	import logic from "@/logic";

	const videoInputs = ref<MediaDeviceInfo[]>([]);
	const screens = ref<{id: string; name: string; thumbnail: string}[]>([]);
	const windows = ref<{id: string; name: string; thumbnail: string}[]>([]);

	const selectSource = ref<{id: string; type: string} | null>(null);

	onMounted(() => {
		navigator.mediaDevices.enumerateDevices().then((devices) => {
			videoInputs.value = devices.filter((device) => device.kind === "videoinput");
			console.log(videoInputs.value);
		});

		ipcRenderer.invoke("getScreens").then((data) => (screens.value = data));
		ipcRenderer.invoke("getWindows").then((data) => (windows.value = data));
	});

	const onContinue = async () => {
		if (selectSource.value) {
			let stream: Ref<MediaStream | null> = ref(null);
			if (selectSource.value.type === "screen" || selectSource.value.type === "window") {
				stream.value = await navigator.mediaDevices.getUserMedia({
					audio: false,
					video: {
						mandatory: {
							chromeMediaSource: "desktop",
							chromeMediaSourceId: selectSource.value.id,
							minWidth: 1280,
							minHeight: 720,
						},
					},
				} as any);
			} else if (selectSource.value.type === "videoInput") {
				stream.value = await navigator.mediaDevices.getUserMedia({
					video: {deviceId: selectSource.value.id},
				});
			}

			if (!stream.value) return;

			logic.setSource(stream.value);
		}
	};
</script>
<template>
	<dialog id="chooseSourceModal" class="modal">
		<div class="modal-box">
			<h3 class="font-bold text-lg pb-4">Choose source</h3>

			<h4 class="font-bold text-md">Screens</h4>

			<div class="flex flex-wrap gap-x-3 gap-y-3 my-4">
				<DevicePreviewCard
					v-for="screen in screens"
					:id="screen.id"
					:name="screen.name"
					:thumbnail="screen.thumbnail"
					@click="selectSource = {id: screen.id, type: 'screen'}"
					:active="selectSource?.id === screen.id"
				/>
			</div>

			<h4 class="font-bold text-md py-3">Windows</h4>

			<div class="flex flex-wrap gap-x-3 gap-y-3 my-4">
				<DevicePreviewCard
					v-for="window in windows"
					:id="window.id"
					:name="window.name"
					:thumbnail="window.thumbnail"
					@click="selectSource = {id: window.id, type: 'window'}"
					:active="selectSource?.id === window.id"
				/>
			</div>

			<h4 class="font-bold text-md py-3">Video Inputs</h4>
			<ul class="menu bg-neutral-50 w-full rounded-box">
				<li
					v-for="input in videoInputs"
					:class="input.deviceId === selectSource?.id ? 'bg-neutral-200' : ''"
					@click="selectSource = {id: input.deviceId, type: 'videoInput'}"
				>
					<a>{{ input.label }}</a>
				</li>
			</ul>

			<div class="modal-action">
				<form method="dialog" class="flex gap-x-2">
					<button
						class="btn btn-sm bg-info text-white border-none shadow-lg"
						@click="onContinue"
					>
						Continue
					</button>

					<button class="btn btn-sm bg-error text-white border-none shadow-lg">
						Cancel
					</button>
				</form>
			</div>
		</div>
	</dialog>
</template>
