const historyDiv = document.getElementById('history');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('sendBtn');

const messageHistory = [];

const API_URL = "https://cors-proxy.psteam.vip/proxy?url=https://in-sparrow.elastic.io/hook/68303e13d0aa2300129b76f9";

function addMessage(content, sender) {
  const msg = document.createElement('div');
  msg.className = sender === 'user' ? 'user-msg' : 'bot-msg';

  const prefix = sender === 'user' ? "You: " : "AI agent: ";

  if (sender === 'bot') {
    msg.innerHTML = prefix + marked.parse(content);
  } else {
    msg.textContent = prefix + content;
  }

  historyDiv.appendChild(msg);
  historyDiv.scrollTop = historyDiv.scrollHeight;
}


sendBtn.addEventListener('click', async () => {
  const text = messageInput.value.trim();
  if (!text) return;

    messageHistory.push({
        role: 'user',
        content: [
            { type: 'text', text: text }
        ]
    });

  addMessage(text, 'user');
  messageInput.value = '';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages: messageHistory })
    });

    const result = await response.json();
    const reply = result.reply[0];

    messageHistory.push({
    role: 'assistant',
    content: [
        { type: 'text', text: reply }
    ]
    });

    addMessage(reply || 'No reply received', 'bot');
  } catch (err) {
    addMessage('Error: ' + err.message, 'bot');
  }
});
