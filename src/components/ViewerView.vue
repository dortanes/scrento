<script setup lang="ts">
	import logic from "@/logic";
	import {onMounted, ref, watch} from "vue";

	const player = ref<HTMLVideoElement>();

	onMounted(() => {
		window.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				logic.destroy();
				window.close();
			}
		});
	});

	watch(logic.source, () => {
		if (!player.value) return;

		player.value.srcObject = logic.source.value;
		player.value.play();
	});
</script>
<template>
	<main class="w-screen h-screen relative bg-black">
		<video class="w-full h-full" ref="player" autoplay />

		<div
			class="absolute top-0 left-0 w-full h-full flex items-center justify-center"
			v-if="logic.isViewLoading.value"
		>
			<span class="loading text-white loading-spinner loading-lg" />
		</div>
	</main>
</template>
