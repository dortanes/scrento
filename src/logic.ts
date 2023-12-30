import {Ref, ref} from "vue";
import Diont, {IService} from "diont";
import * as peerjs from "peerjs";
import {ipcRenderer} from "electron";

interface DeviceInfo {
	id: string;
	role?: string;
}

type AnnounceServiceId = `${string}:${string}:${string}`;

class Peer extends EventTarget {
	private id: string;
	private targetId?: string;
	private stream?: MediaStream;
	private peer: peerjs.Peer;

	constructor(id: string, stream?: MediaStream, targetId?: string) {
		super();

		this.id = id;
		this.targetId = targetId;
		this.stream = stream;
		this.peer = new peerjs.Peer(id);
	}

	start() {
		console.log("Starting peer");

		this.peer.on("open", (id) => {
			console.log("My peer ID is: " + id);

			if (this.stream) this.listenCall();
			else this.call();
		});

		this.peer.on("connection", (conn) => {
			conn.on("data", (data) => {
				console.log(data);
			});
		});
	}

	listenCall() {
		this.peer.on("call", (call) => {
			call.answer(
				this.stream as MediaStream,
				{
					offerToReceiveVideo: 0,
					offerToReceiveAudio: 0,
				} as any
			);
			this.dispatchEvent(new CustomEvent("viewer", {detail: call}));
		});
	}

	private createFakeStream() {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		if (!ctx) return null;

		canvas.width = 64;
		canvas.height = 64;
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		return canvas.captureStream(1);
	}

	async call() {
		const conn = this.peer.connect(this.targetId as string);

		conn.on("open", () => {
			const call = this.peer.call(
				this.targetId as string,
				this.createFakeStream() as MediaStream,
				{
					offerToReceiveAudio: 0,
					offerToReceiveVideo: 1,
				} as any
			);

			call.on("stream", (stream) => {
				this.dispatchEvent(new CustomEvent("stream", {detail: stream}));
			});
		});

		// });
	}

	stop() {
		this.peer.disconnect();
		this.peer.destroy();
	}
}

class Logic {
	private discovery = Diont();

	private announceId: AnnounceServiceId = "0:0:0";
	public id: Ref<string | null> = ref(localStorage.getItem("id"));
	public role: Ref<string | null> = ref(localStorage.getItem("role"));

	public devices: Ref<DeviceInfo[]> = ref([]);

	public isStreaming: Ref<boolean> = ref(false);
	public viewersCount: Ref<number> = ref(0);

	public source: Ref<MediaStream | null> = ref(null);
	private peer: Peer | null = null;

	public viewDeviceId: Ref<string | null> = ref(null);
	public isViewLoading: Ref<boolean> = ref(true);

	constructor() {
		if (!this.id.value) this.setId(null);
		if (!this.role.value) this.setRole(null);

		this.listenEvents();
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
		this.id.value = id ?? Math.random().toString(36).substr(2, 9);
		localStorage.setItem("id", this.id.value);
	}

	setRole(role: string | null) {
		this.role.value = role ?? "streamer";
		localStorage.setItem("role", this.role.value);
	}

	switchRole() {
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

			this.peer.addEventListener("viewer", (event) => {
				this.viewersCount.value++;
				const call = (event as CustomEvent).detail as peerjs.MediaConnection;

				call.on("iceStateChanged", (state) => {
					if (state === "disconnected") {
						this.viewersCount.value--;
					}
				});
			});
		}

		this.viewersCount.value = 0;
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

		this.peer = new Peer(this.id.value as string, undefined, id);

		this.peer.addEventListener("stream", (event) => {
			this.isViewLoading.value = false;
			const stream = (event as CustomEvent).detail as MediaStream;
			this.source.value = stream;
		});

		this.peer.start();
	}
}

export default new Logic();
