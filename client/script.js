import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
  element.textContent = '';
  loadInterval = setInterval(() => {
    element.textContent += '.';
    if (element.textContent.length === 4) {
      element.textContent = '';
    }
  }, 300);
}


function typetext(element,text){
  let index = 0;
  let interval = setInterval(()=>{
    if(index < text.length){
      element.innerHTML += text.charAt(index)
      index++;
    }else{
      clearInterval(interval);
    }
  },20)
}

function generateUniqueId(){
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
} 

function chatStripe(isAI, value, uniqueId) {
  return `
    <div class="wrapper ${isAI && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img src="${isAI ? bot : user}" alt="${isAI ? 'bot' : 'user'}" />
        </div>
        <div class="message" id="${uniqueId}">
          ${value}
        </div>
      </div>
    </div>
  `;
}


const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // User's chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get('promt'));
  form.reset();

  // Bot's chat stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, '', uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  // Fetch data from server -> bot's response
  try {
    const response = await fetch('http://localhost:5000', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        prompt: data.get('promt')
      })
    });

    if (response.ok) {
      const responseData = await response.json();
      const completion = responseData.bot.trim();

      messageDiv.innerHTML = ''; // Clear the loader
      typetext(messageDiv, completion);
    } else {
      const errorText = await response.text();

      messageDiv.innerHTML = "Something went wrong! :(";
      alert(errorText);
    }
  } catch (error) {
    console.log(error);
  }
}


form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});