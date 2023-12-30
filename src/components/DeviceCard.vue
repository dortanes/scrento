<script setup lang="ts">
	defineProps<{id: string}>();
	const emit = defineEmits(["click"]);
</script>
<template>
	<div class="card w-[30%] shadow-lg">
		<div class="card-body py-2 text-center">
			<h2 v-text="id" />
		</div>
		<div class="card-actions">
			<button class="btn btn-sm w-full bg-neutral-100 border-none" @click="emit('click')">
				Watch
			</button>
		</div>
	</div>
</template>
