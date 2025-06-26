const historyDiv = document.getElementById('history');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('sendBtn');
const validateSwitch = document.getElementById('validateSwitch');

const messageHistory = [];

const API_URL = "https://cors-proxy.psteam.vip/proxy?url=https://in-sparrow.elastic.io/hook/68303e13d0aa2300129b76f9";

function addMessage(content, sender) {
  const msg = document.createElement('div');
  msg.className = sender === 'user' ? 'user-msg' : 'bot-msg';
  msg.innerHTML = (sender === 'bot')
    ? `<strong>AI agent:</strong> ${marked.parse(content)}`
    : `<strong>You:</strong> ${content}`;
  historyDiv.appendChild(msg);
  historyDiv.scrollTop = historyDiv.scrollHeight;
}

sendBtn.addEventListener('click', async () => {
  const text = messageInput.value.trim();
  if (!text) return;

  const validateInput = validateSwitch.checked;

  messageHistory.push({
    role: 'user',
    content: [{ type: 'text', text }]
  });

  addMessage(text, 'user');
  messageInput.value = '';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messageHistory, validateInput})
    });

    const result = await response.json();
    if (!result?.reply) throw new Error(result?.error?.message || 'Unknown error');

    const reply = result.reply[0] || 'No reply received';

    messageHistory.push({
      role: 'assistant',
      content: [{ type: 'text', text: reply }]
    });

    addMessage(reply, 'bot');
  } catch (err) {
    addMessage('Error: ' + err.message, 'bot');
  }
});
