<script setup lang="ts">
	import logic from "../logic";
	import DeviceCard from "../components/DeviceCard.vue";
	import ChooseSourceModal from "../components/ChooseSourceModal.vue";
</script>

<template>
	<div class="flex justify-between flex-row">
		<div class="text-xl flex items-center gap-x-3 px-8 py-4 font-light">
			<div
				class="tooltip tooltip-right tooltip-error"
				data-tip="All connections will be dropped!"
			>
				<button
					class="btn btn-sm bg-white border-none shadow-lg"
					@click="() => logic.setId(null)"
				>
					Reset
				</button>
			</div>
			<span class="badge badge-lg rounded-lg shadow-md px-3 py-4 border-none font-extrabold">
				Device ID
			</span>
			<span>{{ logic.id.value }}</span>
		</div>

		<div
			class="text-xl flex items-center gap-x-3 px-8 py-4 font-light"
			v-if="logic.role.value === 'streamer'"
		>
			<button
				class="btn btn-sm border-none shadow-lg"
				:class="logic.isStreaming.value ? 'btn-error' : 'btn-info'"
				@click="() => logic.toggleStream()"
			>
				{{ logic.isStreaming.value ? "Stop" : "Start" }} stream
			</button>

			<span
				class="badge badge-sm rounded-lg shadow-md px-3 py-4 border-none font-extrabold"
				v-if="logic.isStreaming.value"
			>
				{{ logic.viewersCount.value }} viewers
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
					Switch
				</button>
			</div>
			<span class="badge badge-lg rounded-lg shadow-md px-3 py-4 border-none font-extrabold">
				Role
			</span>
			<span>{{ logic.role.value }}</span>
		</div>
	</div>

	<main class="flex flex-col items-center justify-center px-8 gap-y-4">
		<div class="flex flex-row w-full gap-x-4">
			<div class="card w-[100%] bg-base-100 shadow-xl">
				<div class="card-body gap-y-4">
					<h2 class="card-title">Local devices</h2>
					<span
						class="loading text-accent loading-spinner loading-lg"
						v-if="!logic.devices.value.length && logic.role.value === 'viewer'"
					></span>

					<div
						class="flex flex-wrap gap-x-3 gap-y-2"
						v-if="logic.role.value === 'viewer'"
					>
						<DeviceCard
							v-for="device in logic.devices.value"
							:id="device.id"
							@click="logic.openWatch(device.id)"
						/>
					</div>
					<span class="text-lg text-neutral-400" v-else>
						You can't see this list because you're a streamer
					</span>
				</div>
			</div>

			<!-- <div class="card w-[40%] bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title">Connect a device</h2>
					<input
						type="text"
						placeholder="Device ID"
						class="input shadow-md border-1 border-neutral-100 input-primary w-full"
					/>

					<button class="btn bg-white border-none shadow-lg">Connect</button>
				</div>
			</div> -->
		</div>

		<ChooseSourceModal />
	</main>
</template>

<style scoped></style>
