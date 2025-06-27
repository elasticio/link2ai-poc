const historyDiv = document.getElementById('history');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('sendBtn');
const validateSwitch = document.getElementById('validateSwitch');

const messageHistory = [];

const API_URL = "https://cors-proxy.psteam.vip/proxy?url=https://in-sparrow.elastic.io/hook/68303e13d0aa2300129b76f9";

function addMessage(content, sender, note = null) {
  if (note) {
    const noteDiv = document.createElement('div');
    noteDiv.className = 'text-muted small fst-italic mb-1';
    noteDiv.textContent = note;
    historyDiv.appendChild(noteDiv);
  }
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

  messageInput.value = '';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messageHistory, validateInput})
    });

    const result = await response.json();
    if (!result?.reply) throw new Error(result?.error?.message || 'Unknown error');

    const validationNote = validateInput ? 'Prompt is valid. Checked with Link2AI ✅' : null;

    addMessage(text, 'user', validationNote);

    const reply = result.reply[0] || 'No reply received';

    messageHistory.push({
      role: 'assistant',
      content: [{ type: 'text', text: reply }]
    });

    addMessage(reply, 'bot');
  } catch (err) {
    const validationNote = validateInput && err.message === 'Malicious intent detected!' ? 'Prompt rejected. Malicious input detected by Link2AI ❌' : null;
    addMessage('Error: ' + err.message, 'bot', validationNote);
  }
});
