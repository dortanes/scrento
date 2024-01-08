<script setup lang="ts">
	import logic from "../logic";
</script>
<template>
	<div class="flex justify-between flex-row fixed top-0 w-full z-10 my-2">
		<div class="text-xl flex items-center gap-x-3 px-8 py-4 font-light">
			<div
				class="tooltip tooltip-right tooltip-error"
				data-tip="All connections will be dropped!"
			>
				<button
					class="btn btn-sm bg-white border-none shadow-lg"
					@click="() => logic.setId(null)"
				>
					<vue-feather type="rotate-cw" class="opacity-80 w-4" />
				</button>
			</div>
			<span
				class="badge badge-lg rounded-lg shadow-md px-3 py-4 border-none font-extrabold"
				v-text="logic.id.value"
			/>
		</div>

		<div
			class="text-xl flex items-center gap-x-3 px-8 py-4 font-light"
			v-if="logic.role.value === 'streamer'"
		>
			<button
				v-if="logic.isStreaming.value"
				class="btn btn-sm border-none shadow-lg focus:shadow-md btn-error"
				@click="() => logic.toggleStream()"
				v-text="`Stop stream`"
			/>

			<span
				class="badge badge-sm rounded-lg shadow-md px-3 py-4 border-none font-extrabold gap-x-2"
				v-if="logic.isStreaming.value"
			>
				<vue-feather type="eye" class="opacity-80 w-4" />
				{{ logic.viewers.value.length }}
			</span>
		</div>

		<div class="text-xl flex items-center gap-x-3 px-8 py-4 font-light">
			<div
				class="tooltip tooltip-left tooltip-error"
				data-tip="All connections will be dropped!"
			>
				<button
					class="btn btn-sm bg-white border-none shadow-lg"
					@click="logic.switchRole()"
				>
					<vue-feather
						:type="logic.role.value === 'streamer' ? 'toggle-right' : 'toggle-left'"
						class="opacity-80 w-4"
					/>
				</button>
			</div>
			<span class="badge badge-lg rounded-lg shadow-md px-3 py-4 border-none font-extrabold">
				{{ logic.role.value?.toLocaleUpperCase() }}
			</span>
		</div>
	</div>
</template>
