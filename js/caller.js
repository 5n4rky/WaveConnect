let APP_ID = "d25bf915b9e44303928861d87f18f0ce";
let token = null;
let inputConfig;
let localStream;
let videoTrack;
let peerConnection;
let uid = String(Math.floor(Math.random() * 100000));
let client;
let channel;
let endMeetingButton;

let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get('room');
inputConfig = urlParams.get('inputConfig')

if(!roomId)
{
    window.location = '../index.html'
   console.log('404 not found')
}
document.getElementById('roomName').innerText = roomId;

const server = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
}
let runLoader = () => {
    document.getElementById('loader').style.display = 'block'
    document.getElementById('mobile-box').style.display = 'none'
}
let stopLoader = () => {
    document.getElementById('loader').style.display = 'none'
    document.getElementById('mobile-box').style.display = 'flex'
}

let buildLocalStream= async()=>
{
    if(inputConfig === 'mic')
    {
        localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
        document.getElementById('user-1').srcObject = localStream
    }
    if(inputConfig === 'systemAudio')
    {
        localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        videoTrack = localStream.getTracks().find(track => track.kind === 'video')
        videoTrack.enabled = false
        document.getElementById('user-1').srcObject = localStream
    }
}
let createPeerConnection = async (MemberId) => {


    peerConnection = new RTCPeerConnection(server)

    

    // if (!localStream) {
    //     await buildLocalStream();
    // }


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
let sendHostInfo = (memberId)=>
{
    client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'hostInfo', 'ID': uid }) }, memberId)
}
let handleUserJoined = async (memberId) => {
    await createOffer(memberId);
    sendHostInfo(memberId);



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
endMeetingButton = document.getElementById('endWave')

let endMeeting = async ()=>
{ 
    runLoader()
    setTimeout(async ()=>
    {
        await leaveChannel();
        window.location  = '../index.html'
    },1000)
   
    

}

let attemptLogIn  = async()=>
{ 
    
    setTimeout(async()=>
    {
     client = await AgoraRTM.createInstance(APP_ID);
    await client.login({ uid, token });

    channel = client.createChannel(roomId); // room id
    await channel.join();

    await buildLocalStream();
    console.log('permission granted');
    channel.on('MemberJoined', handleUserJoined)
    
    client.on('MessageFromPeer', handleMessageFromPeer)

    stopLoader()
    },1000)
   

}
let init = async () => {

    await attemptLogIn()
   
  endMeetingButton.addEventListener('click', endMeeting)

}
let leaveChannel = async ()=>
{
    await channel.leave()
    await client.logout();
}
window.addEventListener('beforeunload',leaveChannel);

init();