import * as qrcode from "qrcode";
import { iceServers } from "../iceServers";

window.addEventListener('load', () => {
    const ws = new WebSocket(`wss://${location.host}`);
    const peerConnection = new RTCPeerConnection({
        iceServers
    });
    ws.addEventListener('message', message => {
        console.log('ws messaged', typeof message.data);
        const messageText = message.data + '';
        const data = JSON.parse(messageText) as
            { type: 'candidate'; candidate: RTCIceCandidateInit; } |
            { type: 'sessionDescription'; sessionDescription: RTCSessionDescriptionInit; };

        if (data.type === 'sessionDescription') {
            const description = new RTCSessionDescription(data.sessionDescription);
            if (description.type !== 'offer') {
                return;
            }

            peerConnection.setRemoteDescription(description).then(() => {
                return navigator.mediaDevices.getUserMedia({ 'video': false, 'audio': true });
            }).then(stream => {
                return Promise.all(peerConnection.getTransceivers().map(transceiver => {
                    if (transceiver.receiver.track.kind === 'video') {
                        return;
                    }
                    const [track] = stream.getAudioTracks();
                    transceiver.direction = 'sendonly';
                    if (!track) {
                        return;
                    }
                    return transceiver.sender.replaceTrack(track);
                }));
            }).then(() => {
                return peerConnection.createAnswer();
            }).then(async answer => {
                await peerConnection.setLocalDescription(answer);
                return answer;
            }).then((answer) => {
                ws.send(JSON.stringify({ type: 'sessionDescription', sessionDescription: answer }));
            });
        } else if (data.type === 'candidate') {
            const candidate = new RTCIceCandidate(data.candidate);
            peerConnection.addIceCandidate(candidate);
        }
    });
    peerConnection.addEventListener('icecandidate', event => {
        if ('candidate' in event && event.candidate) {
            ws.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
        }
    });

    const canvas = document.getElementsByTagName('canvas')[0];
    qrcode.toCanvas(canvas, `https://${location.host}/mobile/`, err => {
        if (err) console.error(err);
    });
});
