import { iceServers } from "../iceServers";

window.addEventListener('load', () => {
    console.log('load');
    const remoteAudio = document.getElementById('remote') as HTMLAudioElement;

    const remoteSrc = remoteAudio.srcObject = new MediaStream();

    const ws = new WebSocket(`wss://${location.host}`);
    const peerConnection = new RTCPeerConnection({
        iceServers
    });
    ws.addEventListener('message', message => {
        const data = JSON.parse(message.data + '') as
            { type: 'candidate', candidate: RTCIceCandidateInit; } |
            { type: 'sessionDescription', sessionDescription: RTCSessionDescriptionInit; };

        if (data.type === 'sessionDescription') {
            const description = new RTCSessionDescription(data.sessionDescription);
            peerConnection.setRemoteDescription(description);
        } else if (data.type === 'candidate') {
            const candidate = new RTCIceCandidate(data.candidate);
            peerConnection.addIceCandidate(candidate);
        }
    });
    peerConnection.addEventListener('icecandidate', event => {
        if ('candidate' in event && event.candidate) {
            ws.send(JSON.stringify({ type: 'candidate', 'candidate': event.candidate.toJSON() }));
        }
    });
    peerConnection.addEventListener('track', event => {
        remoteSrc.addTrack(event.track);
    });

    peerConnection.addTransceiver('audio', { direction: 'recvonly' });

    const listener = () => {
        remoteAudio.play();

        peerConnection.createOffer().then(sessionDescription => {
            peerConnection.setLocalDescription(sessionDescription).then(() => {
                console.log(sessionDescription);
                ws.send(JSON.stringify({ type: 'sessionDescription', sessionDescription }));
            });
        });
    };
    document.body.addEventListener('click', listener, { once: true });
});
