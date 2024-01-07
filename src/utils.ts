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
		maxFramerate = 60,
		priority = "high" as RTCPriorityType,
		scaleResolutionDownBy = 1,
		degradationPreference = "maintain-framerate" as RTCDegradationPreference,
	}
) {
	peer.onconnectionstatechange = () => {
		if (peer.connectionState === "connected") {
			const sender = peer.getSenders().filter((s) => s.track?.kind === "video")[0];

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
	};
}
