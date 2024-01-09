export function createFakeStream() {
	const canvas = document.createElement("canvas");
	canvas.width = 1;
	canvas.height = 1;
	return canvas.captureStream(1);
}

export function patchWrtcParameters(
	peer: RTCPeerConnection,
	{
		maxBitrate = 8000000,
		maxFramerate = 100,
		priority = "high" as RTCPriorityType,
		scaleResolutionDownBy = 1,
		degradationPreference = "maintain-framerate" as RTCDegradationPreference,
	}
) {
	console.info("Patching WebRTC parameters", peer.connectionState);

	const patch = () => {
		if (peer.connectionState === "connected") {
			const sender = peer.getSenders().filter((s) => s.track?.kind === "video")[0];

			if (sender) {
				sender.setParameters({
					...sender.getParameters(),
					encodings: [
						{
							maxBitrate,
							maxFramerate,
							priority,
							scaleResolutionDownBy,
						},
					],

					degradationPreference,
				});
			}
		}
	};

	patch();

	peer.onconnectionstatechange = () => {
		console.info("Connection state changd", peer.connectionState);
		patch();
	};
}
