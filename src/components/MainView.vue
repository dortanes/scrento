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
				class="btn btn-sm border-none shadow-lg focus:shadow-md"
				:class="logic.isStreaming.value ? 'btn-error' : 'btn-info'"
				@click="() => logic.toggleStream()"
			>
				{{ logic.isStreaming.value ? "Stop" : "Start" }} stream
			</button>

			<span
				class="badge badge-sm rounded-lg shadow-md px-3 py-4 border-none font-extrabold"
				v-if="logic.isStreaming.value"
			>
				{{ logic.viewers.value.length }} viewers
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
			<div
				class="hero min-h-[90vh] rounded-box"
				v-if="logic.role.value === 'streamer' && !logic.isStreaming.value"
			>
				<div class="hero-content text-center">
					<div class="max-w-md">
						<h1 class="text-5xl font-extrabold">Let's watch!</h1>
						<p class="py-6 font-light">
							Start a stream or select the desired stream to watch.<br />
							It's a piece of cake!
						</p>
						<button
							class="btn btn-sm border-none shadow-lg focus:shadow-md"
							:class="logic.isStreaming.value ? 'btn-error' : 'btn-info'"
							@click="() => logic.toggleStream()"
						>
							Start stream
						</button>
					</div>
				</div>
			</div>

			<div class="card w-[50%] bg-base-100 shadow-xl" v-else>
				<div class="card-body gap-y-4" v-if="logic.role.value === 'viewer'">
					<h2 class="card-title">Local streams</h2>

					<span
						class="text-lg text-neutral-400"
						v-if="!logic.devices.value.length"
						v-text="'There is no streams'"
					/>

					<div class="flex flex-wrap gap-x-3 gap-y-2" v-else>
						<DeviceCard
							v-for="device in logic.devices.value"
							:id="device.id"
							@click="logic.openWatch(device.id)"
						/>
					</div>
				</div>

				<div class="card-body gap-y-4">
					<h2 class="card-title">Currently watching</h2>

					<ul class="menu px-0 w-full gap-y-1.5" v-if="logic.viewers.value.length > 0">
						<li
							class="text-base font-light px-4 py-2 bg-white border border-neutral-200 rounded-box"
							v-for="peerId in logic.viewers.value"
						>
							{{ peerId }}
						</li>
					</ul>

					<span class="text-lg text-neutral-400" v-text="'There is no viewers'" v-else />
				</div>
			</div>

			<div class="card w-[50%] bg-base-100 shadow-xl" v-else>
				<div class="card-body gap-y-4" v-if="logic.role.value === 'viewer'">
					<h2 class="card-title">Available streams</h2>

					<span
						class="text-lg text-neutral-400"
						v-if="!logic.devices.value.length"
						v-text="'There is no streams'"
					/>

					<div class="flex flex-wrap gap-x-3 gap-y-2" v-else>
						<DeviceCard
							v-for="device in logic.devices.value"
							:id="device.id"
							@click="logic.openWatch(device.id)"
						/>
					</div>
				</div>

				<div class="card-body gap-y-4" v-else>
					<h2 class="card-title">Currently watching</h2>

					<ul class="menu px-0 w-full gap-y-1.5" v-if="logic.viewers.value.length > 0">
						<li
							class="text-base font-light px-4 py-2 bg-white border border-neutral-200 rounded-box"
							v-for="peerId in logic.viewers.value"
						>
							{{ peerId }}
						</li>
					</ul>

					<span class="text-lg text-neutral-400" v-text="'There is no viewers'" v-else />
				</div>
			</div>
		</div>

		<ChooseSourceModal />
	</main>
</template>

<style scoped></style>

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
