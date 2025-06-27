const historyDiv = document.getElementById('history');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('sendBtn');
const validateSwitch = document.getElementById('validateSwitch');

const messageHistory = [];

const API_URL = "https://cors-proxy.psteam.vip/proxy?url=https://in-sparrow.elastic.io/hook/68303e13d0aa2300129b76f9";

function addMessage(content, sender, noteText = null) {
  const wrapper = document.createElement('div');
  // Optional note
  let noteDiv = null;
  if (noteText !== undefined) {
    noteDiv = document.createElement('div');
    noteDiv.className = 'text-muted small fst-italic mb-1';
    noteDiv.textContent = noteText || ''; // can be empty initially
    wrapper.appendChild(noteDiv);
  }

  const msg = document.createElement('div');
  msg.className = sender === 'user' ? 'user-msg' : 'bot-msg';
  msg.innerHTML = (sender === 'bot')
    ? `<strong>AI agent:</strong> ${marked.parse(content)}`
    : `<strong>You:</strong> ${content}`;

  wrapper.appendChild(msg);
  historyDiv.appendChild(wrapper);
  historyDiv.scrollTop = historyDiv.scrollHeight;

  return noteDiv;
}

sendBtn.addEventListener('click', async () => {
  const text = messageInput.value.trim();
  if (!text) return;

  const validateInput = validateSwitch.checked;
  messageInput.value = '';

  const noteRef = addMessage(text, 'user', validateInput ? '' : undefined);

  messageHistory.push({
    role: 'user',
    content: [{ type: 'text', text }]
  });

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messageHistory, validateInput})
    });

    const result = await response.json();

    if (!result?.reply) {
      if (noteRef && result?.error?.message === 'Malicious intent detected!') {
        noteRef.textContent = 'Prompt rejected. Malicious input detected by Link2AI ❌';
      }
      throw new Error(result?.error?.message || 'Unknown error');
    }

    if (noteRef) {
      noteRef.textContent = 'Prompt is valid. Checked with Link2AI ✅';
    }

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
