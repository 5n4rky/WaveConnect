let APP_ID = "d25bf915b9e44303928861d87f18f0ce";
let token = null;
let remoteStream;
let peerConnection;
let uid = String(Math.floor(Math.random() * 100000));
let client;
let channel;
let hostID;

let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get('room');

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

let createPeerConnection = async (MemberId) => {


    peerConnection = new RTCPeerConnection(server)

    remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream
    document.getElementById('user-2').style.display = 'block'

  


   


    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            console.log('!ALERT!the kind of track recieved is ',track.kind)
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
let updateCard = ()=>
{
    document.getElementById('cardImg').src ="https://i.pinimg.com/736x/bc/16/f7/bc16f7c9ad7bd6f1cdf0bf75816f43ff.jpg";
    document.getElementById('roomName').innerText= "Oops! host left"
    document.getElementById('user-2').style.display = 'none'
    document.getElementById('audioplayer').style.display = 'none'

    let homeButton = document.getElementById('homePage')

    homeButton.style.display = 'block'
    homeButton.addEventListener('click',()=>
    {
        window.location = '../index.html'
    })
    
}
let handleUserLeft = async (memberId) =>
{
  if(memberId === hostID)
  {
    await leaveChannel();
    updateCard();
   
   

    
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
    
    if(message.type === 'hostInfo')
    {
        hostID = message.ID
    }
}
let init = async () => {

    client = await AgoraRTM.createInstance(APP_ID);
    await client.login({ uid, token });

    channel = client.createChannel(roomId); // room id
    await channel.join();



   
    
    client.on('MessageFromPeer', handleMessageFromPeer);
    channel.on('MemberLeft', handleUserLeft)


   


    







}
let leaveChannel = async ()=>
{
    await channel.leave()
    await client.logout();
}
window.addEventListener('beforeunload',leaveChannel);
init();

