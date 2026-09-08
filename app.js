const q = document.getElementById("question");
const ask = document.getElementById("ask");
const answer = document.getElementById("answer");
const photo = document.getElementById("photo");
const photoTool = document.getElementById("photoTool");
const micBtn = document.getElementById("micBtn");

let chatHistory = [];

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setLoading() {
  if (answer) {
    answer.innerHTML = "🤖 EduAI सोच रहा है...";
  }
}

function showAnswer(text) {
  if (answer) {
    answer.innerHTML = text;
  }
}

async function askAI(text, imageData = null) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: text,
        image: imageData
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AI जवाब नहीं दे पाया");
    }

    return data.answer || "मुझे जवाब नहीं मिला।";
  } catch (error) {
    return "❌ AI से जवाब नहीं मिल पाया। कृपया दोबारा कोशिश करें।";
  }
}

async function sendQuestion(text, imageData = null) {
  text = (text || "").trim();

  if (!text && !imageData) return;

  addUserMessage(text || "📷 Photo Question");

  const loading = addAIMessage("🤖 EduAI सोच रहा है...");

  const result = await askAI(text, imageData);

  loading.innerHTML = formatAIText(result);

  chatHistory.push({
    user: text,
    ai: result
  });
}

function formatAIText(text) {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}

function createChatScreen() {
  if (document.getElementById("eduaiChatScreen")) return;

  const screen = document.createElement("div");
  screen.id = "eduaiChatScreen";

  screen.innerHTML = `
    <div class="edu-chat-header">
      <button id="chatBack">←</button>
      <div>
        <strong>EduAI</strong>
        <small>● AI Tutor • Online</small>
      </div>
      <button id="newChat">＋</button>
    </div>

    <div id="chatMessages" class="edu-chat-messages">
      <div class="edu-ai-msg">
        <div class="edu-avatar">E</div>
        <div class="edu-bubble">
          नमस्ते! 👋<br><br>
          मैं <strong>EduAI</strong> हूँ।<br>
          पढ़ाई से जुड़ा कोई भी सवाल पूछिए।
          <br><br>
          📚 Maths • Science • Hindi • English<br>
          🎓 School • College • UPSC
        </div>
      </div>
    </div>

    <div class="edu-chat-input-area">
      <button id="chatPhoto">📷</button>
      <input id="chatInput" type="text" placeholder="अपना सवाल लिखें..." autocomplete="off">
      <button id="chatMic">🎤</button>
      <button id="chatSend">➤</button>
      <input id="chatFile" type="file" accept="image/*" hidden>
    </div>
  `;

  document.body.appendChild(screen);

  document.getElementById("chatBack").onclick = () => {
    screen.remove();
  };

  document.getElementById("newChat").onclick = () => {
    document.getElementById("chatMessages").innerHTML = `
      <div class="edu-ai-msg">
        <div class="edu-avatar">E</div>
        <div class="edu-bubble">
          नया chat शुरू हो गया। 😊<br>
          अपना सवाल पूछिए।
        </div>
      </div>
    `;
    chatHistory = [];
  };

  const input = document.getElementById("chatInput");
  const send = document.getElementById("chatSend");

  send.onclick = () => {
    const text = input.value;
    input.value = "";
    sendQuestion(text);
  };

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      send.click();
    }
  });

  document.getElementById("chatPhoto").onclick = () => {
    document.getElementById("chatFile").click();
  };

  document.getElementById("chatFile").onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
      await sendQuestion("", reader.result);
    };

    reader.readAsDataURL(file);
  };

  document.getElementById("chatMic").onclick = startVoice;
}

function addUserMessage(text) {
  const messages = document.getElementById("chatMessages");
  if (!messages) return;

  const div = document.createElement("div");
  div.className = "edu-user-msg";

  div.innerHTML = `
    <div class="edu-user-bubble">${escapeHtml(text)}</div>
  `;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function addAIMessage(text) {
  const messages = document.getElementById("chatMessages");

  const div = document.createElement("div");
  div.className = "edu-ai-msg";

  div.innerHTML = `
    <div class="edu-avatar">E</div>
    <div class="edu-bubble">${text}</div>
  `;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;

  return div.querySelector(".edu-bubble");
}

function startVoice() {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("आपके browser में Voice सुविधा उपलब्ध नहीं है।");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "hi-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    document.getElementById("chatInput").placeholder =
      "🎤 सुन रहा हूँ...";
  };

  recognition.onresult = event => {
    const text = event.results[0][0].transcript;
    document.getElementById("chatInput").value = text;
  };

  recognition.onend = () => {
    document.getElementById("chatInput").placeholder =
      "अपना सवाल लिखें...";
  };

  recognition.start();
}

/* Existing home page question box */

if (ask) {
  ask.onclick = async () => {
    const text = q.value.trim();

    if (!text) return;

    setLoading();

    const result = await askAI(text);

    showAnswer(formatAIText(result));
  };
}

if (q) {
  q.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      ask?.click();
    }
  });
}

/* Existing photo question */

if (photoTool && photo) {
  photoTool.onclick = () => photo.click();

  photo.onchange = () => {
    const file = photo.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
      setLoading();

      const result = await askAI("", reader.result);

      showAnswer(formatAIText(result));
    };

    reader.readAsDataURL(file);
  };
}

/* Existing microphone */

if (micBtn) {
  micBtn.onclick = startVoice;
}

/* Open full AI chat from AI Tutor navigation */

document.querySelectorAll(".nav").forEach(nav => {
  nav.addEventListener("click", () => {
    const text = nav.textContent.toLowerCase();

    if (
      text.includes("ai tutor") ||
      text.includes("tutor")
    ) {
      createChatScreen();
    }
  });
});
