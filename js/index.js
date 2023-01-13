let theCard=document.querySelector('#theCard')
let formBox1=document.querySelector('#formBox1')
let formBox2=document.querySelector('#formBox2')
let formBox3=document.querySelector('#formBox3')
let logoBox=document.querySelector('#logoBox')

//The hover function on the card
const logoBoxRightNull = () =>{
    logoBox.style.right='0px'
}
formBox1.addEventListener('mouseover',logoBoxRightNull)
formBox2.addEventListener('mouseover', logoBoxRightNull)
formBox3.addEventListener('mouseover', logoBoxRightNull)
logoBox.addEventListener('mouseover',logoBoxRightNull)
theCard.addEventListener('mouseout', (e)=>{
    logoBox.style.right='340px'
})


//Clicking Buttons on Form1

let createTeamBtn = formBox1.querySelector('#createTeamBtn')
createTeamBtn.addEventListener('click', (e)=>{
    formBox2.style.zIndex='10';
    formBox3.style.zIndex='1';
    formBox1.style.zIndex='1';
})

let joinTeamBtn = formBox1.querySelector('#joinTeamBtn')
joinTeamBtn.addEventListener('click', (e)=>{
    formBox2.style.zIndex='1';
    formBox3.style.zIndex='10';
    formBox1.style.zIndex='1';
})

let backBtn2 = formBox2.getElementsByClassName('backButton')[0]
backBtn2.addEventListener('click', (e)=>{
    formBox2.style.zIndex='1';
    formBox3.style.zIndex='1';
    formBox1.style.zIndex='10';
})

let backBtn3 = formBox3.getElementsByClassName('backButton')[0]
backBtn3.addEventListener('click', (e)=>{
    formBox2.style.zIndex='1';
    formBox3.style.zIndex='1';
    formBox1.style.zIndex='10';
})

//The Room ID Generator is here.. Uncomment and use it
// const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-']
// let roomIdGenerator = () =>{
//     let ans='';
//     for(var i=0; i<6; i++){
//         ans+=letters[Math.floor(Math.random() * 36)]
//     }
//     return ans
// }


//The working of Site Goes after this line

let form = document.getElementById('create-form');
let form2 = document.getElementById('join-form');

let createMeeting = document.querySelector('#createMeeting')
createMeeting.addEventListener('click', (e) => {
    let inputConfig;
    let inviteCode = form.meetingName.value
    let buttons = document.querySelectorAll('input[name="micSetting"]')
    for(let radiobutton of buttons)
    {
        if(radiobutton.checked)
        {
            inputConfig= radiobutton.value
        }
    }

    window.location = `./views/caller.html?room=${inviteCode}&inputConfig=${inputConfig}`
})

let joinMeeting= document.querySelector('#joinMeeting')
joinMeeting.addEventListener('click', () => {
    let inviteCode = form2.meetingId.value
    window.location = `./views/reciever.html?room=${inviteCode}`
})