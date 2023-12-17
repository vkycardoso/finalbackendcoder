const socket = io();
socket.emit('userIdentified', username);

socket.on('chatHistory', (messages) => {
  const chatHistory = document.getElementById('chatHistory');

  chatHistory.innerHTML = '';
  messages.forEach(message => {
    chatHistory.innerHTML += `<div class="p-2 mb-1 rounded bg-light">${message}</div>`;
  });
  chatHistory.scrollTop = chatHistory.scrollHeight; 
});

const chatForm = document.getElementById('chatForm');
chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const chatInput = document.getElementById('chatInput');
  const newMessage = `${new Date().toLocaleString()}  -  ${username.toUpperCase()}: ${chatInput.value}`;
  socket.emit('newMessage', username, newMessage);
  chatInput.value = '';
});
