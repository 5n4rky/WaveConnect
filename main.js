let APP_ID = "d25bf915b9e44303928861d87f18f0ce";
let token = null;
let localStream;
let remoteStream;
let localstream;
let remotestream;
let peerConnection;
let uid = String(Math.floor(Math.random() * 100000));
let client;
let channel;


let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get('room');

if(!roomId)
{
    window.location = 'lobby.html'
   console.log('404 not found')
}




















const server = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
}
// create peerConnection
let createPeerConnection = async (MemberId) => {


    peerConnection = new RTCPeerConnection(server)

    remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream
    document.getElementById('user-2').style.display = 'block'

    if (!localStream) {
        localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        document.getElementById('user-1').srcObject = localStream
    }


    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
    })


    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track)
            console.log('heyyyy')
        })
    }


    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'candidate', 'candidate': event.candidate }) }, MemberId)

        }
    }
}
//creates offer and sends to memeberId
let createOffer = async (memberId) => {

    await createPeerConnection(memberId);
    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);


    // sdp - offer
    client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'offer', 'offer': offer }) }, memberId);

}
let createAnswer = async (memberId, offer) => {
    await createPeerConnection(memberId);

    await peerConnection.setRemoteDescription(offer);

    let answer = await peerConnection.createAnswer();

    await peerConnection.setLocalDescription(answer);

    client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'answer', 'answer': answer }) }, memberId);

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
let handleUserLeft = async (memberId) =>
{
  document.getElementById('user-2').style.display = 'none';

}
let handleMessageFromPeer = async (message, memberId) => {
    message = JSON.parse(message.text);
    if (message.type === 'offer') {
        createAnswer(memberId, message.offer);
    }

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



    channel.on('MemberJoined', handleUserJoined);
    channel.on('MemberLeft',handleUserLeft)
    client.on('MessageFromPeer', handleMessageFromPeer);

    localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
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
