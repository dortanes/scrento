import {Ref, ref} from "vue";
import Diont, {IService} from "diont";
import {Room, joinRoom} from "trystero";
import {ipcRenderer} from "electron";
import {createFakeStream, patchWrtcParameters} from "./utils";

interface DeviceInfo {
	id: string;
	role?: string;
}

type AnnounceServiceId = `${string}:${string}:${string}`;
const isViewerMode = () => !!window.process.argv.find((arg) => arg.startsWith("--deviceId="));

class Peer extends EventTarget {
	private id: string;
	private targetId?: string;
	private stream?: MediaStream;
	private room: Room;

	get state() {
		const peers = this.room.getPeers();

		// get first
		const peer = Object.values(peers)[0];
		return peer?.connectionState;
	}

	constructor(id: string, stream?: MediaStream, targetId?: string) {
		super();

		this.id = id;
		this.targetId = targetId;
		this.stream = stream;
		this.room = joinRoom(
			{
				appId: "scrento",
				rtcConfig: {
					bundlePolicy: "max-bundle",
				},
			},
			this.targetId ?? this.id
		);
	}

	start() {
		// On peer join
		this.room.onPeerJoin((peerId) => {
			this.dispatchEvent(new CustomEvent("join", {detail: peerId}));
			if (this.stream) this.room.addStream(this.stream as MediaStream, peerId);
		});

		// On peer leave
		this.room.onPeerLeave((peerId) => {
			if (isViewerMode()) {
				this.room.leave();
				window.close();
			}

			this.dispatchEvent(new CustomEvent("leave", {detail: peerId}));
		});

		// On stream received
		this.room.onPeerStream((stream, peerId) => {
			// Patch WebRTC parameters
			const peers = this.room.getPeers();
			const peer = peers[peerId];
			patchWrtcParameters(peer as RTCPeerConnection, {});

			this.dispatchEvent(new CustomEvent("stream", {detail: stream}));
		});
	}

	stop() {
		this.room.removeStream(this.stream as MediaStream);
		this.room.leave();
	}
}

class Logic {
	private discovery = Diont();

	private announceId: AnnounceServiceId = "0:0:0";
	public id: Ref<string | null> = ref(localStorage.getItem("id"));
	public role: Ref<string | null> = ref(localStorage.getItem("role"));

	public devices: Ref<DeviceInfo[]> = ref([]);

	public isStreaming: Ref<boolean> = ref(false);
	public viewers: Ref<string[]> = ref([]);

	public source: Ref<MediaStream | null> = ref(null);
	private peer: Peer | null = null;

	public viewDeviceId: Ref<string | null> = ref(null);
	public isViewLoading: Ref<boolean> = ref(true);

	constructor() {
		if (!this.id.value) this.setId(null);
		if (!this.role.value) this.setRole(null);

		this.listenEvents();
	}

	get peerState() {
		return this.peer?.state;
	}

	listenEvents() {
		this.discovery.on("serviceAnnounced", (serviceInfo) => {
			console.log("A new service was announced", serviceInfo.service);

			const index = this.devices.value.findIndex(
				(device) => device.id === serviceInfo.service.name
			);

			if (index !== -1) return;

			this.devices.value.push({
				id: serviceInfo.service.name,
				role: (serviceInfo.service as IService & {role: string}).role,
			});
		});

		this.discovery.on("serviceRenounced", (serviceInfo) => {
			const index = this.devices.value.findIndex(
				(device) => device.id === serviceInfo.service.name
			);

			console.log("A service was renounced", serviceInfo.service, index);

			if (index !== -1) this.devices.value.splice(index, 1);
		});
	}

	announce() {
		const serviceId = this.discovery.announceService({
			name: this.id.value,
			role: this.role.value,
		});

		this.announceId = serviceId as AnnounceServiceId;

		console.log("Announced service");
	}

	setId(id: string | null) {
		if (this.role.value === "streamer" && this.isStreaming.value) {
			this.toggleStream();
		}

		this.id.value = id ?? Math.random().toString(36).substr(2, 9);
		localStorage.setItem("id", this.id.value);
	}

	setRole(role: string | null) {
		this.role.value = role ?? "streamer";
		localStorage.setItem("role", this.role.value);
	}

	switchRole() {
		if (this.role.value === "streamer" && this.isStreaming.value) {
			this.toggleStream();
		}

		this.setRole(this.role.value === "streamer" ? "viewer" : "streamer");
	}

	toggleStream() {
		if (!this.isStreaming.value) {
			if (!this.source.value) return (window as any).chooseSourceModal.showModal();
			this.announce();
		} else {
			this.discovery.renounceService(this.announceId);
		}

		this.isStreaming.value = !this.isStreaming.value;
		this.viewers.value = [];

		if (!this.isStreaming.value) {
			this.source.value?.getTracks().forEach((track) => track.stop());
			this.source.value = null;

			if (this.peer) {
				this.peer.stop();
				this.peer = null;
			}
		} else {
			this.peer = new Peer(this.id.value as string, this.source.value as MediaStream);
			this.peer.start();

			this.peer.addEventListener("join", (e) => {
				this.viewers.value.push((e as CustomEvent<string>).detail);
			});

			this.peer.addEventListener("leave", (e) => {
				const index = this.viewers.value.findIndex(
					(id) => id === (e as CustomEvent<string>).detail
				);
				if (index !== -1) this.viewers.value.splice(index, 1);
			});
		}
	}

	setSource(source: MediaStream) {
		this.source.value = source;
		this.toggleStream();
	}

	destroy() {
		this.discovery.renounceService(this.announceId);
	}

	openWatch(id: string) {
		ipcRenderer.invoke("openWindow", [`--deviceId=${id}`]);
	}

	setViewDeviceId(id: string) {
		this.viewDeviceId.value = id;

		this.peer = new Peer(this.id.value as string, createFakeStream(), id);

		this.peer.addEventListener("stream", (event) => {
			this.isViewLoading.value = false;
			const stream = (event as CustomEvent).detail as MediaStream;
			this.source.value = stream;
		});

		this.peer.start();
	}
}

export default new Logic();
