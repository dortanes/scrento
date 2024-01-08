<script setup lang="ts">
	import logic from "../logic";
	import DeviceCard from "../components/DeviceCard.vue";
	import ChooseSourceModal from "../components/ChooseSourceModal.vue";
	import Navbar from "../components/Navbar.vue";
</script>

<template>
	<Navbar />

	<main class="flex flex-col min-h-[60%] items-center justify-center px-8 gap-y-4">
		<div class="flex flex-row w-full gap-x-4">
			<div class="hero min-h-full rounded-box">
				<!-- Streamer -->
				<div
					class="w-full min-h-screen hero-content text-center"
					v-if="logic.role.value === 'streamer'"
				>
					<!-- If not streaming -->
					<div class="max-w-md" v-if="!logic.isStreaming.value">
						<h1 class="text-5xl font-extrabold">Let's stream!</h1>
						<p class="py-6 font-light">
							Select a needed source to watch.<br />
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

					<!-- If streaming -->
					<div class="w-full max-w-lg" v-else>
						<div class="card w-full bg-base-100 shadow-xl">
							<div class="card-body gap-y-4">
								<h2 class="card-title">Currently watching</h2>

								<ul
									class="menu px-0 w-full gap-y-1.5"
									v-if="logic.viewers.value.length > 0"
								>
									<li
										class="text-base font-light px-4 py-2 bg-white border border-neutral-200 rounded-box"
										v-for="peerId in logic.viewers.value"
									>
										{{ peerId }}
									</li>
								</ul>

								<span
									class="text-left text-lg text-neutral-400"
									v-text="'There is no viewers'"
									v-else
								/>
							</div>
						</div>
					</div>
				</div>

				<!-- Viewer -->
				<div
					class="w-full hero-content text-center"
					v-else-if="logic.role.value === 'viewer'"
				>
					<div class="w-full max-w-xl text-left">
						<h1 class="text-5xl font-extrabold">Let's watch!</h1>
						<p class="py-4 font-light">
							Choose the desired stream to watch.<br />
							It's a piece of cake!
						</p>

						<div class="card w-full bg-base-100 shadow-xl text-left">
							<div class="card-body gap-y-4">
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
						</div>
					</div>
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
