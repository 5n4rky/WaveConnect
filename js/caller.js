let APP_ID = "7f7fb91b9abb498bbf6546299524e9fd";
let token = null;
let inputConfig;
let localStream;
let remoteStream;
let localAudioTrack;
let remoteAudioTrack;
let videoTrack;
let peerConnection;
let uid = String(Math.floor(Math.random() * 100000));
let client;
let channel;
let endMeetingButton;

let btnMic;
let btnVolume;


endMeetingButton = document.getElementById('endWave')
btnVolume = document.querySelector('.volume_on')
btnMic  = document.querySelector('.mic_on')




let handleVolumeState = async()=>
{
    state = btnVolume.innerText
    if(state === 'volume_up')
    {
        btnVolume.innerText = 'volume_off'
       
        remoteAudioTrack.enabled = false
    }
    else
    {
        btnVolume.innerText = 'volume_up'
        remoteAudioTrack.enabled = true
    }
}



let handleMicState = async()=>
{
    state = btnMic.innerText
    if(state === 'mic')
    {
     btnMic.innerText = 'mic_off'
     localAudioTrack.enabled = false
    }
    else
    {
       btnMic.innerText = 'mic'
       localAudioTrack.enabled = true
       
    }
}




let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get('room');
let roomName = urlParams.get('name')
inputConfig = urlParams.get('inputConfig')

if(!roomId)
{
    window.location = '../index.html'
   console.log('404 not found')
}
document.getElementById('roomName').innerText = roomName;
document.getElementById('roomID').innerText = roomId;

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
        
        remoteStream = new MediaStream()
        document.getElementById('user-1').srcObject = remoteStream
        
    }
    if(inputConfig === 'systemAudio')
    { 
        btnVolume.style.color = '#d3d3d3'
        btnVolume.innerText = 'volume_off'

        localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })

        videoTrack = localStream.getTracks().find(track => track.kind === 'video')
        videoTrack.enabled = false
        
    }
    
    localAudioTrack = localStream.getTracks().find(track=>track.kind ==='audio')
    btnMic.addEventListener('click',handleMicState)

}



let createPeerConnection = async (MemberId) => {


    peerConnection = new RTCPeerConnection(server)

    

   

    
    localStream.getTracks().forEach((track) => {
        if(track.kind === 'audio')
        peerConnection.addTrack(track, localStream)
    })

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            
            remoteStream.addTrack(track)
            remoteAudioTrack = remoteStream.getTracks().find(track => track.kind === 'audio')
            btnVolume.addEventListener('click',handleVolumeState);
            
            

        })
    }


    


    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
           await client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'candidate', 'candidate': event.candidate }) }, MemberId)

        }
    }
}

let createOffer = async (memberId) => {

    await createPeerConnection(memberId);
    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);


    // sdp - offer
  await client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'offer', 'offer': offer, 'hostID': uid , 'waveType' : inputConfig ,'roomName':roomName}) }, memberId);
 
}
let addAnswer = async (answer) => {
    if (!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(answer);
    }
}

let handleUserJoined = async (memberId) => {

    

    
    
    await createOffer(memberId);
   

    
    
   
    
   



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


let endMeeting = async ()=>
{ 
    runLoader()
    setTimeout(async ()=>
    {
        await leaveChannel();
        window.location  = '../index.html'
    },1000)
   
    

}

let init = async () => {
 try{
    client = await AgoraRTM.createInstance(APP_ID);
    await client.login({ uid, token });

    channel = client.createChannel(roomId); // room id
    await channel.join();
    channel.on('MemberJoined', handleUserJoined)
    
    client.on('MessageFromPeer', handleMessageFromPeer)
    endMeetingButton.addEventListener('click', endMeeting)
    await buildLocalStream();


    console.log('permission granted');
   

    stopLoader()

 }
 catch(error)
 {
    window.alert(error + '  :=> Please refresh')
 }
   
  

}
let leaveChannel = async ()=>
{
    await channel.leave()
    await client.logout();
}
window.addEventListener('beforeunload',leaveChannel);

init();