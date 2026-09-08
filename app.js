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
/* ================================
   EDUAI CLASS / COURSE DASHBOARD
   ================================ */

const eduaiCourses = {

  "Nursery": {
    title: "Nursery",
    subtitle: "Early Learning • Basics",
    subjects: [
      "Hindi",
      "English",
      "Numbers",
      "Drawing & Coloring",
      "Rhymes",
      "General Awareness"
    ],
    syllabus: [
      "Hindi – स्वर, व्यंजन, चित्र पहचान",
      "English – A-Z, phonics, simple words",
      "Numbers – 1 से 20 तक गिनती",
      "Drawing – रंग और basic shapes",
      "Rhymes – Hindi & English rhymes",
      "General Awareness – शरीर, परिवार, जानवर, फल और सब्जियाँ"
    ]
  },

  "Class 1–5": {
    title: "Class 1–5",
    subtitle: "Primary Education",
    subjects: [
      "Hindi",
      "English",
      "Mathematics",
      "EVS",
      "Computer",
      "General Knowledge"
    ],
    syllabus: [
      "Hindi – भाषा, व्याकरण, पाठ और लेखन",
      "English – Grammar, Reading, Writing",
      "Mathematics – Numbers, Addition, Subtraction, Multiplication, Division",
      "EVS – Plants, Animals, Family, Environment",
      "Computer – Basic Computer Knowledge",
      "General Knowledge – सामान्य ज्ञान और Current Awareness"
    ]
  },

  "Class 6–8": {
    title: "Class 6–8",
    subtitle: "Middle School",
    subjects: [
      "Hindi",
      "English",
      "Mathematics",
      "Science",
      "Social Science",
      "Computer"
    ],
    syllabus: [
      "Mathematics – Number System, Algebra, Geometry, Mensuration",
      "Science – Physics, Chemistry और Biology के basics",
      "Social Science – History, Geography, Civics",
      "Hindi – Literature, Grammar और Writing",
      "English – Literature, Grammar और Writing",
      "Computer – Internet, Programming और Digital Basics"
    ]
  },

  "Class 9–10": {
    title: "Class 9–10",
    subtitle: "Secondary • Foundation",
    subjects: [
      "Hindi",
      "English",
      "Mathematics",
      "Science",
      "Social Science",
      "Computer"
    ],
    syllabus: [
      "Mathematics – Algebra, Geometry, Trigonometry, Statistics",
      "Science – Physics, Chemistry, Biology",
      "Social Science – History, Geography, Political Science, Economics",
      "Hindi – Literature, Grammar, Writing",
      "English – Literature, Grammar, Writing",
      "Computer / IT – Digital Applications और Computer Basics"
    ]
  },

  "Class 11–12": {
    title: "Class 11–12",
    subtitle: "Senior Secondary",
    subjects: [
      "Physics",
      "Chemistry",
      "Mathematics",
      "Biology",
      "Hindi",
      "English",
      "Accountancy",
      "Business Studies",
      "Economics",
      "Political Science",
      "History",
      "Geography"
    ],
    syllabus: [
      "Science Stream – Physics, Chemistry, Mathematics / Biology",
      "Commerce Stream – Accountancy, Business Studies, Economics",
      "Arts Stream – History, Geography, Political Science, Economics",
      "Languages – Hindi / English",
      "हर subject में Chapter-wise syllabus और topics"
    ]
  },

  "BA / BSc / BCom": {
    title: "BA / BSc / BCom",
    subtitle: "Graduation",
    subjects: [
      "BA – History, Political Science, Economics, Hindi, English",
      "BSc – Physics, Chemistry, Mathematics, Biology",
      "BCom – Accountancy, Economics, Business Studies",
      "Computer / Skill Subjects"
    ],
    syllabus: [
      "BA – चुने हुए विषय के अनुसार Semester-wise syllabus",
      "BSc – Science subjects और practical topics",
      "BCom – Accounting, Business, Economics और Finance",
      "Semester-wise subjects और important topics"
    ]
  },

  "MA": {
    title: "MA",
    subtitle: "Post Graduation",
    subjects: [
      "Hindi",
      "English",
      "History",
      "Political Science",
      "Economics",
      "Sociology",
      "Other Specializations"
    ],
    syllabus: [
      "Semester-wise subjects",
      "Advanced Theory",
      "Research Methodology",
      "Important Authors / Thinkers",
      "Important Questions",
      "University-specific topics"
    ]
  },

  "UPSC": {
    title: "UPSC",
    subtitle: "Civil Services Examination",
    subjects: [
      "History",
      "Geography",
      "Indian Polity",
      "Economy",
      "Environment",
      "Science & Technology",
      "Current Affairs",
      "Ethics",
      "CSAT"
    ],
    syllabus: [
      "Prelims – General Studies Paper I",
      "Prelims – CSAT Paper II",
      "History & Indian National Movement",
      "Indian and World Geography",
      "Indian Polity & Governance",
      "Economic & Social Development",
      "Environment & Ecology",
      "Science & Technology",
      "Current Affairs",
      "Mains – Essay",
      "Mains – General Studies I, II, III, IV",
      "Optional Subject",
      "Interview / Personality Test"
    ]
  }
};


/* ---------- COURSE SCREEN ---------- */

function openEduAICourse(courseName) {

  const course = eduaiCourses[courseName];

  if (!course) return;

  const oldScreen = document.getElementById("eduaiCourseScreen");
  if (oldScreen) oldScreen.remove();

  const screen = document.createElement("div");
  screen.id = "eduaiCourseScreen";

  screen.innerHTML = `
    <div style="
      position:fixed;
      inset:0;
      z-index:99999;
      background:#f7fbfa;
      overflow-y:auto;
      font-family:Arial,sans-serif;
    ">

      <div style="
        position:sticky;
        top:0;
        z-index:2;
        background:#087f75;
        color:white;
        padding:18px 16px;
        box-shadow:0 2px 10px rgba(0,0,0,.15);
      ">

        <div style="
          display:flex;
          align-items:center;
          gap:14px;
        ">

          <button id="eduCourseBack" style="
            border:0;
            background:rgba(255,255,255,.15);
            color:white;
            width:42px;
            height:42px;
            border-radius:50%;
            font-size:25px;
          ">‹</button>

          <div>
            <div style="
              font-size:22px;
              font-weight:700;
            ">${course.title}</div>

            <div style="
              font-size:14px;
              opacity:.9;
              margin-top:3px;
            ">${course.subtitle}</div>
          </div>

        </div>
      </div>


      <div style="padding:20px 16px 40px;">

        <div style="
          background:white;
          border-radius:18px;
          padding:18px;
          box-shadow:0 3px 15px rgba(0,0,0,.07);
          margin-bottom:18px;
        ">

          <div style="
            font-size:20px;
            font-weight:700;
            margin-bottom:8px;
          ">
            📚 ${course.title} के बारे में
          </div>

          <div style="
            color:#666;
            line-height:1.6;
          ">
            इस section में आप ${course.title} से संबंधित
            subjects, syllabus, chapters और important topics
            को आसानी से देख सकते हैं।
          </div>

        </div>


        <h2 style="margin:20px 0 12px;">
          📖 Subjects
        </h2>

        <div style="
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:12px;
        ">

          ${course.subjects.map(subject => `
            <button
              class="eduSubjectBtn"
              data-subject="${subject}"
              style="
                background:white;
                border:1px solid #e1e8e6;
                border-radius:16px;
                padding:15px 10px;
                text-align:left;
                font-size:15px;
                font-weight:600;
                box-shadow:0 2px 8px rgba(0,0,0,.04);
              "
            >
              📘 ${subject}
            </button>
          `).join("")}

        </div>


        <h2 style="margin:25px 0 12px;">
          📝 Syllabus
        </h2>

        <div style="
          background:white;
          border-radius:18px;
          padding:16px;
          box-shadow:0 3px 15px rgba(0,0,0,.06);
        ">

          ${course.syllabus.map((item, index) => `
            <div style="
              padding:14px 5px;
              border-bottom:${index === course.syllabus.length - 1 ? "0" : "1px solid #edf1f0"};
              line-height:1.5;
            ">
              <b>${index + 1}.</b> ${item}
            </div>
          `).join("")}

        </div>


        <div style="
          margin-top:20px;
          background:#087f75;
          color:white;
          border-radius:18px;
          padding:18px;
        ">

          <div style="
            font-size:19px;
            font-weight:700;
            margin-bottom:8px;
          ">
            🤖 AI से पढ़ें
          </div>

          <div style="
            font-size:14px;
            line-height:1.5;
            opacity:.95;
          ">
            किसी भी subject या topic को चुनकर
            AI Tutor से आसान भाषा में समझ सकते हैं।
          </div>

        </div>

      </div>
    </div>
  `;

  document.body.appendChild(screen);


  document.getElementById("eduCourseBack").onclick = () => {
    screen.remove();
  };


  screen.querySelectorAll(".eduSubjectBtn").forEach(btn => {

    btn.onclick = () => {

      const subject = btn.dataset.subject;

      const question =
        `मुझे ${course.title} के ${subject} विषय के बारे में विस्तार से बताइए। ` +
        `इसका basic information, important chapters, topics और पढ़ने का सही तरीका समझाइए।`;

      screen.remove();

      const input =
        document.querySelector("textarea") ||
        document.querySelector('input[type="text"]');

      if (input) {
        input.value = question;
        input.dispatchEvent(new Event("input", { bubbles:true }));
      }

      const askButton =
        [...document.querySelectorAll("button")]
        .find(b => {
          const t = b.textContent.trim().toLowerCase();
          return t.includes("पूछें") || t.includes("ask");
        });

      if (askButton) {
        askButton.click();
      }
    };

  });

}


/* ---------- MAKE HOME COURSE CARDS CLICKABLE ---------- */

document.addEventListener("click", function(e) {

  let element = e.target;

  while (element && element !== document.body) {

    const text = element.textContent
      ? element.textContent.trim()
      : "";

    const courseNames = Object.keys(eduaiCourses);

    for (const courseName of courseNames) {

      if (
        text === courseName ||
        text.startsWith(courseName)
      ) {

        if (
          element.closest("#eduaiChatScreen") ||
          element.closest("#eduaiCourseScreen")
        ) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        openEduAICourse(courseName);

        return;
      }
    }

    element = element.parentElement;
  }

}, true);
