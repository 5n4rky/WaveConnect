let APP_ID = "7f7fb91b9abb498bbf6546299524e9fd";
let token = null;
let remoteStream;
let localStream;
let remoteAudioTrack;
let localAudioTrack;
let peerConnection;
let uid = String(Math.floor(Math.random() * 100000));
let client;
let channel;
let hostID;
let roomName;
let isChannelValid = 0;
let inputConfig;
let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get('room');
let btnVolume;
let btnMic;
let leaveMeetingButton;



leaveMeetingButton = document.getElementById('endWave')
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



if (!roomId) {
    window.location = '../index.html'
    console.log('404 not found')
}
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
let buildLocalStream = async () => {

   
    
    localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
    localAudioTrack = localStream.getTracks().find(track => track.kind === 'audio')
    btnMic.addEventListener('click',handleMicState)
    



}
let createPeerConnection = async (MemberId) => {


    peerConnection = new RTCPeerConnection(server)
    
    
    remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream
    document.getElementById('user-2').style.display = 'block'

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

    if (inputConfig === 'mic') {
        try{
        
        await buildLocalStream()

        localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream)
        })
    }
    catch(error)
    {
        window.alert(error+' =>refresh or grant proper permission')
    }
    }
    else
    {
        btnMic.style.color = "#d3d3d3"
        btnMic.innerText = 'mic_off'
    }







   
}
let createAnswer = async (memberId, offer) => {
    await createPeerConnection(memberId);

    await peerConnection.setRemoteDescription(offer);

    let answer = await peerConnection.createAnswer();

    await peerConnection.setLocalDescription(answer);

   await client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'answer', 'answer': answer }) }, memberId);

}
let updateCard = async () => {
    document.getElementById('cardImg').src = "https://i.pinimg.com/736x/bc/16/f7/bc16f7c9ad7bd6f1cdf0bf75816f43ff.jpg";
    document.getElementById('roomName').innerText = "Oops! host left"



    
    btnMic.style.visibility = 'hidden'
    btnVolume.style.visibility = 'hidden'
    leaveMeetingButton.style.visibility = 'hidden'

    let homeButton = document.getElementById('homePage')

    homeButton.style.display = 'block'
    homeButton.addEventListener('click', () => {
        window.location = '../index.html'
    })

}
let handleUserLeft = async (memberId) => {
    if (memberId === hostID) {
        runLoader();
       
        await leaveChannel();
       
        await updateCard();
        stopLoader();
      




    }

}

let handleMessageFromPeer = async (message, memberId) => {
  
    
    message = JSON.parse(message.text);
    
    if (message.type === 'offer') {
        
        roomName = message.roomName
        document.getElementById('roomName').innerText = roomName;
        hostID = message.hostID
        inputConfig = message.waveType
        await createAnswer(memberId, message.offer);
        
    }


    if (message.type === 'candidate') {
        if (peerConnection) {
            
            peerConnection.addIceCandidate(message.candidate);
        }
    }


}
let checkRoomValidity = async () => {
    let memberCount = await client.getChannelMemberCount([roomId])

    if (memberCount[roomId] === 1) {
        window.location = '../index.html'
    }
   

}



let leaveWave = async () => {
    runLoader()
    setTimeout(async () => {
        await leaveChannel();
        window.location = '../index.html'
    }, 1000)
}
/*
BUTTONS
*/







let init = async () => {

     try{
    client = await AgoraRTM.createInstance(APP_ID);
    await client.login({ uid, token });

    channel = client.createChannel(roomId); // room id
    await channel.join();
     
    client.on('MessageFromPeer', handleMessageFromPeer);
    channel.on('MemberLeft', handleUserLeft)
    leaveMeetingButton.addEventListener('click', leaveWave)
   

    await checkRoomValidity()

   
    stopLoader();
     }
     catch(error)
     {
        window.alert(error+' => please refresh')
     }



    
}


let leaveChannel = async () => {
    await channel.leave()
    await client.logout();
}


window.addEventListener('beforeunload', leaveChannel);
init()

