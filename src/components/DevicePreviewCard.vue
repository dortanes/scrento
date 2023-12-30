<script setup lang="ts">
	defineProps<{id: string; thumbnail: string; name: string; active: boolean}>();
	const emit = defineEmits(["click"]);
</script>
<template>
	<div
		class="card w-[30%] bg-base-100 shadow-xl cursor-pointer hover:bg-base-200"
		:class="active ? 'bg-neutral-200' : ''"
		@click="emit('click', id)"
	>
		<figure class="shadow-sm">
			<img :src="thumbnail" style="height: 90px" />
		</figure>

		<div class="flex items-center justify-center px-1 py-0.5">
			<h2 class="card-title text-sm truncate mx-2" v-text="name" />
		</div>
	</div>
</template>
