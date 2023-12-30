<script setup lang="ts">
	import {onBeforeMount} from "vue";
	import MainView from "./components/MainView.vue";
	import logic from "./logic";
	import ViewerView from "./components/ViewerView.vue";

	window.onbeforeunload = () => logic.destroy();

	onBeforeMount(() => {
		const arg = window.process.argv.find((arg) => arg.startsWith("--deviceId="));
		if (arg) {
			const id = arg.split("=")[1];
			logic.setViewDeviceId(id);
		}
	});
</script>

<template>
	<MainView v-if="!logic.viewDeviceId.value" />
	<ViewerView v-else />
</template>

<style scoped></style>
