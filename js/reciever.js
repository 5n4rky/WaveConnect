let APP_ID = "d25bf915b9e44303928861d87f18f0ce";
let token = null;
let remoteStream;
let localStream;
let peerConnection;
let uid = String(Math.floor(Math.random() * 100000));
let client;
let channel;
let hostID;
let leaveMeetingButton;
let isChannelValid = 0;
let inputConfig;
let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get('room');

if (!roomId) {
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
    
    localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
        
    
    
}
let createPeerConnection = async (MemberId) => {


    peerConnection = new RTCPeerConnection(server)

    remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream
    document.getElementById('user-2').style.display = 'block'

    if(inputConfig === 'mic')
    {
        await buildLocalStream()

        localStream.getTracks().forEach((track) => {
            if(track.kind === 'audio')
            peerConnection.addTrack(track, localStream)
        })
    }







    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            console.log('!ALERT!the kind of track recieved is ', track.kind)
            remoteStream.addTrack(track)

        })
    }


    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'candidate', 'candidate': event.candidate }) }, MemberId)

        }
    }
}
let createAnswer = async (memberId, offer) => {
    await createPeerConnection(memberId);

    await peerConnection.setRemoteDescription(offer);

    let answer = await peerConnection.createAnswer();

    await peerConnection.setLocalDescription(answer);

    client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'answer', 'answer': answer }) }, memberId);

}
let updateCard = async () => {
    document.getElementById('cardImg').src = "https://i.pinimg.com/736x/bc/16/f7/bc16f7c9ad7bd6f1cdf0bf75816f43ff.jpg";
    document.getElementById('roomName').innerText = "Oops! host left"
    document.getElementById('user-2').style.display = 'none'
    document.getElementById('audioplayer').style.display = 'none'
    document.getElementById('endWave').style.display = 'none'

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
        createAnswer(memberId, message.offer);
    }


    if (message.type === 'candidate') {
        if (peerConnection) {
            peerConnection.addIceCandidate(message.candidate);
        }
    }

    if (message.type === 'hostInfo') {
        hostID = message.ID
        inputConfig = message.waveType
    }
}
let checkRoomValidity = async ()=>
{
    let memberCount = await client.getChannelMemberCount([roomId])

    if(memberCount[roomId] === 1)
    {
        window.location = '../index.html'
    }
    else
    isChannelValid = 1
   
}
let attemptJoiningChannel = async (roomId) => {

    setTimeout(async () => {
        client = await AgoraRTM.createInstance(APP_ID);
        await client.login({ uid, token });

        channel = client.createChannel(roomId); // room id
        await channel.join();
        
         await checkRoomValidity()

        if(isChannelValid === 1)
       { 
        
        client.on('MessageFromPeer', handleMessageFromPeer);
        channel.on('MemberLeft', handleUserLeft)
        stopLoader();









        }
    }, 1000)


}
leaveMeetingButton = document.getElementById('endWave');

let leaveWave = async () => {
    runLoader()
    setTimeout(async () => {
        await leaveChannel();
        window.location = '../index.html'
    }, 1000)
}

let init = async () => {



  await attemptJoiningChannel(roomId)
  leaveMeetingButton.addEventListener('click', leaveWave)
}


let leaveChannel = async () => {
    await channel.leave()
    await client.logout();
}


window.addEventListener('beforeunload', leaveChannel);
init();

