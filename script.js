const historyDiv = document.getElementById('history');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('sendBtn');
const validateSwitch = document.getElementById('validateSwitch');
const alertBox = document.getElementById('alertBox');

const messageHistory = [];

const API_URL = "https://cors-proxy.psteam.vip/proxy?url=https://in-sparrow.elastic.io/hook/68303e13d0aa2300129b76f9";

function addMessage(content, sender) {
  let msg;
  if (sender === 'bot') {
  
    const wrapper = document.createElement('div');
    wrapper.className = 'bot-msg-wrapper';

    const icon = document.createElement('div');
    icon.className = 'bot-icon';
    icon.innerHTML = '<svg fill="white" width="30px" height="35px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.928 11.607c-.202-.488-.635-.605-.928-.633V8c0-1.103-.897-2-2-2h-6V4.61c.305-.274.5-.668.5-1.11a1.5 1.5 0 0 0-3 0c0 .442.195.836.5 1.11V6H5c-1.103 0-2 .897-2 2v2.997l-.082.006A1 1 0 0 0 1.99 12v2a1 1 0 0 0 1 1H3v5c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2v-5a1 1 0 0 0 1-1v-1.938a1.006 1.006 0 0 0-.072-.455zM5 20V8h14l.001 3.996L19 12v2l.001.005.001 5.995H5z"/><ellipse cx="8.5" cy="12" rx="1.5" ry="2"/><ellipse cx="15.5" cy="12" rx="1.5" ry="2"/><path d="M8 16h8v2H8z"/></svg>';

    msg = document.createElement('div');
    msg.className = 'bot-msg';
    msg.textContent = content;

    wrapper.appendChild(icon);
    wrapper.appendChild(msg);
    historyDiv.appendChild(wrapper);
  } else {
    msg = document.createElement('div');
    msg.className = 'user-msg';
    msg.textContent = content;
    historyDiv.appendChild(msg);
  }
  historyDiv.scrollTop = historyDiv.scrollHeight;

    return {
    msgRef: msg
  };
}

sendBtn.addEventListener('click', async () => {
  const text = messageInput.value.trim();
  if (!text) return;

  const validateInput = validateSwitch.checked;
  messageInput.value = '';

  addMessage(text, 'user');

  messageHistory.push({
    role: 'user',
    content: [{ type: 'text', text }]
  });

   const { msgRef: thinkingMsg } = addMessage('💬 AI agent is thinking...', 'bot');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messageHistory, validateInput})
    });

    const result = await response.json();

    if (!result?.reply) {
      if (result?.error?.message === 'Malicious intent detected!') {
        alertBox.textContent = 'Prompt rejected. Malicious input detected by Link2AI ❌';
        alertBox.className= 'alert alert-danger alert-message d-flex';
      }
      throw new Error(result?.error?.message || 'Unknown error');
    } else if (validateInput) {
      alertBox.textContent = 'Prompt is valid. Checked with Link2AI ✅';
      alertBox.className= 'alert alert-success alert-message d-flex';
    }

    if (!validateInput) alertBox.className= 'd-none ';

    const reply = result.reply[0] || 'No reply received';

    messageHistory.push({
      role: 'assistant',
      content: [{ type: 'text', text: reply }]
    });

    thinkingMsg.innerHTML = `${marked.parse(reply)}`;
  } catch (err) {
     thinkingMsg.innerHTML = `${err.message}`;
  }
});

 addMessage("Hello! How can I help you today?", "bot");
