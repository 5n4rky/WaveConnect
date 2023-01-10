let APP_ID = "d25bf915b9e44303928861d87f18f0ce";
let token = null;
let localStream;
let videoTrack;
let peerConnection;
let uid = String(Math.floor(Math.random() * 100000));
let client;
let channel;

let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get('room');

if(!roomId)
{
    window.location = '../index.html'
   console.log('404 not found')
}


const server = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
}



let createPeerConnection = async (MemberId) => {


    peerConnection = new RTCPeerConnection(server)

    

    if (!localStream) {
        localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        videoTrack = localStream.getTracks().find(track => track.kind === 'video')
        videoTrack.enabled = false
        document.getElementById('user-1').srcObject = localStream
    }


    localStream.getTracks().forEach((track) => {
        if(track.kind === 'audio')
        peerConnection.addTrack(track, localStream)
    })


    


    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'candidate', 'candidate': event.candidate }) }, MemberId)

        }
    }
}

let createOffer = async (memberId) => {

    await createPeerConnection(memberId);
    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);


    // sdp - offer
    client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'offer', 'offer': offer }) }, memberId);

}
let addAnswer = async (answer) => {
    if (!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(answer);
    }
}
let handleUserJoined = async (memberId) => {
    console.log('a new user joined the channel', memberId);
    createOffer(memberId);

}
let handleMessageFromPeer = async (message, memberId) => {
    message = JSON.parse(message.text);
   

    if (message.type === 'answer') {
        addAnswer(message.answer);
    }
    if (message.type === 'candidate') {
        if (peerConnection) {
            peerConnection.addIceCandidate(message.candidate);
        }
    }
}

let init = async () => {

    client = await AgoraRTM.createInstance(APP_ID);
    await client.login({ uid, token });

    channel = client.createChannel(roomId); // room id
    await channel.join();



    channel.on('MemberJoined', handleUserJoined)
    
    client.on('MessageFromPeer', handleMessageFromPeer)

    localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
    videoTrack = localStream.getTracks().find(track => track.kind === 'video')
    videoTrack.enabled = false
    document.getElementById('user-1').srcObject = localStream;



    console.log('permission granted');







}
let leaveChannel = async ()=>
{
    await channel.leave()
    await client.logout();
}
window.addEventListener('beforeunload',leaveChannel);
init();