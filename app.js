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
});/* =========================================
   EDUAI - CLASS > SUBJECT > CHAPTER SYSTEM
   ========================================= */

const eduaiStudyData = {

  "Nursery": {
    subtitle: "Early Learning • Basics",
    subjects: {
      "Hindi": [
        "स्वर और व्यंजन",
        "चित्र पहचान",
        "शब्द पहचान",
        "सरल कविताएँ"
      ],
      "English": [
        "Alphabet A-Z",
        "Phonics",
        "Simple Words",
        "Rhymes"
      ],
      "Numbers": [
        "1 से 10 तक गिनती",
        "11 से 20 तक गिनती",
        "Shapes",
        "Counting Practice"
      ]
    }
  },

  "Class 1–5": {
    subtitle: "Primary Education",
    subjects: {
      "Hindi": [
        "पाठ और कहानी",
        "शब्द और वाक्य",
        "संज्ञा",
        "सर्वनाम",
        "क्रिया",
        "लेखन"
      ],
      "English": [
        "Alphabet & Words",
        "Nouns",
        "Pronouns",
        "Verbs",
        "Tenses Basics",
        "Reading & Writing"
      ],
      "Mathematics": [
        "Numbers",
        "Addition",
        "Subtraction",
        "Multiplication",
        "Division",
        "Fractions",
        "Geometry"
      ],
      "EVS": [
        "My Family",
        "Plants",
        "Animals",
        "Water",
        "Food",
        "Environment"
      ],
      "Computer": [
        "Computer Basics",
        "Parts of Computer",
        "Keyboard & Mouse",
        "Internet Basics"
      ]
    }
  },

  "Class 6–8": {
    subtitle: "Middle School",
    subjects: {
      "Hindi": [
        "गद्य",
        "पद्य",
        "व्याकरण",
        "संधि",
        "समास",
        "लेखन"
      ],
      "English": [
        "Prose",
        "Poetry",
        "Grammar",
        "Tenses",
        "Writing",
        "Comprehension"
      ],
      "Mathematics": [
        "Number System",
        "Integers",
        "Fractions",
        "Algebra",
        "Geometry",
        "Mensuration",
        "Data Handling"
      ],
      "Science": [
        "Food",
        "Materials",
        "Motion",
        "Light",
        "Electricity",
        "Living Organisms",
        "Environment"
      ],
      "Social Science": [
        "History",
        "Geography",
        "Civics",
        "Resources",
        "Government"
      ]
    }
  },

  "Class 9–10": {
    subtitle: "Secondary • Foundation",
    subjects: {
      "Hindi": [
        "गद्य खंड",
        "पद्य खंड",
        "व्याकरण",
        "लेखन",
        "अपठित बोध"
      ],
      "English": [
        "Literature",
        "Grammar",
        "Reading",
        "Writing",
        "Comprehension"
      ],
      "Mathematics": [
        "Number Systems",
        "Polynomials",
        "Linear Equations",
        "Quadratic Equations",
        "Triangles",
        "Circles",
        "Statistics"
      ],
      "Science": [
        "Matter",
        "Atoms & Molecules",
        "Motion",
        "Force",
        "Gravitation",
        "Life Processes",
        "Environment"
      ],
      "Social Science": [
        "History",
        "Geography",
        "Political Science",
        "Economics",
        "Democratic Politics"
      ]
    }
  },

  "Class 11–12": {
    subtitle: "Senior Secondary",
    subjects: {
      "Hindi": [
        "गद्य खंड",
        "काव्य खंड",
        "गद्य की विधाएँ",
        "व्याकरण",
        "अभिव्यक्ति और माध्यम",
        "लेखन कौशल"
      ],
      "English": [
        "Prose",
        "Poetry",
        "Grammar",
        "Writing Skills",
        "Reading Skills"
      ],
      "Physics": [
        "Units and Measurements",
        "Motion in a Straight Line",
        "Motion in a Plane",
        "Laws of Motion",
        "Work Energy and Power",
        "Gravitation",
        "Thermodynamics",
        "Waves"
      ],
      "Chemistry": [
        "Basic Concepts of Chemistry",
        "Structure of Atom",
        "Periodic Classification",
        "Chemical Bonding",
        "Thermodynamics",
        "Equilibrium",
        "Organic Chemistry Basics"
      ],
      "Mathematics": [
        "Sets",
        "Relations and Functions",
        "Trigonometric Functions",
        "Complex Numbers",
        "Linear Inequalities",
        "Permutations and Combinations",
        "Probability",
        "Statistics"
      ],
      "Biology": [
        "The Living World",
        "Biological Classification",
        "Plant Kingdom",
        "Animal Kingdom",
        "Cell Structure",
        "Biomolecules",
        "Human Physiology",
        "Plant Physiology"
      ],
      "Accountancy": [
        "Introduction to Accounting",
        "Theory Base of Accounting",
        "Recording Transactions",
        "Bank Reconciliation",
        "Trial Balance",
        "Depreciation"
      ],
      "Business Studies": [
        "Nature of Business",
        "Forms of Business Organisation",
        "Private and Public Sector",
        "Business Services",
        "Emerging Modes of Business"
      ],
      "Economics": [
        "Introduction to Economics",
        "Consumer Behaviour",
        "Production",
        "Market",
        "National Income",
        "Money and Banking"
      ],
      "Political Science": [
        "Constitution",
        "Rights",
        "Election",
        "Executive",
        "Legislature",
        "Judiciary"
      ],
      "History": [
        "Early Societies",
        "Empires",
        "Changing Traditions",
        "Industrialisation",
        "Modern World"
      ],
      "Geography": [
        "Geography as a Discipline",
        "Earth",
        "Landforms",
        "Climate",
        "Natural Vegetation",
        "Resources"
      ]
    }
  },

  "BA / BSc / BCom": {
    subtitle: "Graduation",
    subjects: {
      "BA": [
        "History",
        "Political Science",
        "Economics",
        "Hindi",
        "English"
      ],
      "BSc": [
        "Physics",
        "Chemistry",
        "Mathematics",
        "Biology"
      ],
      "BCom": [
        "Accountancy",
        "Business Studies",
        "Economics",
        "Finance"
      ]
    }
  },

  "MA": {
    subtitle: "Post Graduation",
    subjects: {
      "Hindi": [
        "आधुनिक हिंदी साहित्य",
        "काव्यशास्त्र",
        "भाषा विज्ञान",
        "आलोचना",
        "शोध पद्धति"
      ],
      "History": [
        "Ancient History",
        "Medieval History",
        "Modern History",
        "Historiography",
        "Research Methodology"
      ],
      "Political Science": [
        "Political Theory",
        "Indian Politics",
        "International Relations",
        "Public Administration"
      ],
      "Economics": [
        "Micro Economics",
        "Macro Economics",
        "Econometrics",
        "Development Economics"
      ]
    }
  },

  "UPSC": {
    subtitle: "Civil Services Examination",
    subjects: {
      "History": [
        "Ancient India",
        "Medieval India",
        "Modern India",
        "Indian National Movement",
        "World History"
      ],
      "Geography": [
        "Physical Geography",
        "Indian Geography",
        "World Geography",
        "Resources",
        "Environment"
      ],
      "Indian Polity": [
        "Constitution",
        "Fundamental Rights",
        "Parliament",
        "President",
        "Supreme Court",
        "Federalism"
      ],
      "Economy": [
        "Basic Economics",
        "National Income",
        "Banking",
        "Inflation",
        "Budget",
        "Economic Development"
      ],
      "Environment": [
        "Ecology",
        "Biodiversity",
        "Climate Change",
        "Pollution",
        "Environmental Laws"
      ],
      "Science & Technology": [
        "Physics Basics",
        "Biology Basics",
        "Space Technology",
        "Biotechnology",
        "Digital Technology"
      ],
      "Current Affairs": [
        "National News",
        "International News",
        "Government Schemes",
        "Economy",
        "Science & Technology"
      ],
      "CSAT": [
        "Reading Comprehension",
        "Logical Reasoning",
        "Basic Numeracy",
        "Data Interpretation"
      ]
    }
  }
};


/* =========================================
   OPEN CLASS
   ========================================= */

function openEduAIClass(className) {

  const data = eduaiStudyData[className];

  if (!data) return;

  const screen = document.createElement("div");

  screen.id = "eduaiStudyScreen";

  screen.innerHTML = `
    <div class="edu-study-page">

      <div class="edu-study-header">

        <button id="eduStudyBack">‹</button>

        <div>
          <h1>${className}</h1>
          <p>${data.subtitle}</p>
        </div>

      </div>

      <div class="edu-study-body">

        <div class="edu-info-card">
          <h2>📚 ${className}</h2>
          <p>
            यहाँ आपको ${className} के सभी subjects,
            chapters और important topics मिलेंगे।
          </p>
        </div>

        <h2 class="edu-section-title">📖 Subjects</h2>

        <div class="edu-subject-grid">

          ${Object.keys(data.subjects).map(subject => `
            <button
              class="edu-subject-card"
              data-subject="${subject}">
              📘
              <span>${subject}</span>
              <small>${data.subjects[subject].length} Chapters</small>
            </button>
          `).join("")}

        </div>

      </div>

    </div>
  `;

  document.body.appendChild(screen);

  document.getElementById("eduStudyBack").onclick = () => {
    screen.remove();
  };

  screen.querySelectorAll(".edu-subject-card").forEach(button => {

    button.onclick = () => {

      openEduAISubject(
        className,
        button.dataset.subject
      );

    };

  });
}


/* =========================================
   OPEN SUBJECT
   ========================================= */

function openEduAISubject(className, subject) {

  const chapters =
    eduaiStudyData[className]?.subjects?.[subject];

  if (!chapters) return;

  const old = document.getElementById("eduaiStudyScreen");

  if (old) old.remove();

  const screen = document.createElement("div");

  screen.id = "eduaiStudyScreen";

  screen.innerHTML = `
    <div class="edu-study-page">

      <div class="edu-study-header">

        <button id="eduSubjectBack">‹</button>

        <div>
          <h1>${subject}</h1>
          <p>${className}</p>
        </div>

      </div>

      <div class="edu-study-body">

        <div class="edu-info-card">
          <h2>📖 ${subject}</h2>

          <p>
            ${className} के ${subject} विषय के
            सभी chapters यहाँ दिए गए हैं।
          </p>
        </div>

        <h2 class="edu-section-title">
          📝 Chapters
        </h2>

        <div class="edu-chapter-list">

          ${chapters.map((chapter, index) => `

            <button
              class="edu-chapter-card"
              data-chapter="${chapter}"
              data-number="${index + 1}">

              <span class="edu-chapter-number">
                ${index + 1}
              </span>

              <span class="edu-chapter-text">

                <b>Chapter ${index + 1}</b>

                <strong>${chapter}</strong>

                <small>
                  Chapter पढ़ने के लिए क्लिक करें →
                </small>

              </span>

              <span>›</span>

            </button>

          `).join("")}

        </div>

      </div>

    </div>
  `;

  document.body.appendChild(screen);

  document.getElementById("eduSubjectBack").onclick = () => {
    screen.remove();
    openEduAIClass(className);
  };

  screen.querySelectorAll(".edu-chapter-card").forEach(button => {

    button.onclick = () => {

      openEduAIChapter(
        className,
        subject,
        button.dataset.chapter,
        button.dataset.number
      );

    };

  });
}


/* =========================================
   OPEN FULL CHAPTER
   ========================================= */

function openEduAIChapter(
  className,
  subject,
  chapter,
  chapterNumber
) {

  const old = document.getElementById("eduaiStudyScreen");

  if (old) old.remove();

  const screen = document.createElement("div");

  screen.id = "eduaiStudyScreen";

  screen.innerHTML = `

    <div class="edu-study-page">

      <div class="edu-study-header">

        <button id="eduChapterBack">‹</button>

        <div>
          <h1>Chapter ${chapterNumber}</h1>
          <p>${subject} • ${className}</p>
        </div>

      </div>


      <div class="edu-chapter-content">

        <div class="edu-chapter-title">

          <span>📖</span>

          <div>
            <h1>${chapter}</h1>
            <p>
              ${className} • ${subject}
            </p>
          </div>

        </div>


        <section class="edu-content-card">

          <h2>🧠 Chapter का परिचय</h2>

          <p>
            इस chapter में हम
            <b>${chapter}</b>
            के मुख्य concepts को आसान भाषा में समझेंगे।
          </p>

        </section>


        <section class="edu-content-card">

          <h2>📚 इस Chapter में क्या पढ़ेंगे?</h2>

          <ul>

            <li>Chapter के basic concepts</li>

            <li>Important definitions</li>

            <li>मुख्य points और facts</li>

            <li>Examples और practical understanding</li>

            <li>Exam में पूछे जाने वाले important topics</li>

          </ul>

        </section>


        <section class="edu-content-card">

          <h2>📌 Important Points</h2>

          <div class="edu-point">
            1. सबसे पहले chapter के basic concepts समझें।
          </div>

          <div class="edu-point">
            2. Important definitions और formulas को note करें।
          </div>

          <div class="edu-point">
            3. Examples को ध्यान से समझें।
          </div>

          <div class="edu-point">
            4. अंत में questions और practice करें।
          </div>

        </section>


        <section class="edu-content-card">

          <h2>❓ Important Questions</h2>

          <div class="edu-question">
            इस chapter के मुख्य concepts क्या हैं?
          </div>

          <div class="edu-question">
            इस chapter की महत्वपूर्ण definitions कौन-कौन सी हैं?
          </div>

          <div class="edu-question">
            Exam के लिए इस chapter में कौन से topics महत्वपूर्ण हैं?
          </div>

        </section>


        <button
          class="edu-ai-study-btn"
          id="eduChapterAI">

          🤖 AI से पूरा Chapter समझें

        </button>


        <button
          class="edu-ai-study-btn secondary"
          id="eduChapterQuestions">

          📝 AI से Important Questions बनवाएँ

        </button>

      </div>

    </div>
  `;

  document.body.appendChild(screen);


  document.getElementById("eduChapterBack").onclick = () => {

    screen.remove();

    openEduAISubject(
      className,
      subject
    );

  };


  document.getElementById("eduChapterAI").onclick = () => {

    const question =
      `मैं ${className} में ${subject} पढ़ रहा हूँ। ` +
      `मुझे "${chapter}" chapter को बहुत आसान भाषा में ` +
      `step-by-step समझाइए। Basic concepts, examples, ` +
      `important points और exam preparation भी बताइए।`;

    screen.remove();

    const input =
      document.querySelector("textarea") ||
      document.querySelector('input[type="text"]');

    if (input) {

      input.value = question;

      input.dispatchEvent(
        new Event("input", { bubbles: true })
      );

    }

    const askButton =
      [...document.querySelectorAll("button")]
      .find(button => {

        const text =
          button.textContent
            .trim()
            .toLowerCase();

        return (
          text.includes("पूछें") ||
          text.includes("ask")
        );

      });

    if (askButton) {
      askButton.click();
    }

  };


  document.getElementById("eduChapterQuestions").onclick = () => {

    const question =
      `${className} ${subject} के "${chapter}" ` +
      `chapter से exam के लिए important questions ` +
      `और उनके answers तैयार कीजिए।`;

    screen.remove();

    const input =
      document.querySelector("textarea") ||
      document.querySelector('input[type="text"]');

    if (input) {

      input.value = question;

      input.dispatchEvent(
        new Event("input", { bubbles: true })
      );

    }

    const askButton =
      [...document.querySelectorAll("button")]
      .find(button => {

        const text =
          button.textContent
            .trim()
            .toLowerCase();

        return (
          text.includes("पूछें") ||
          text.includes("ask")
        );

      });

    if (askButton) {
      askButton.click();
    }

  };

}


/* =========================================
   MAKE HOME CLASS CARDS CLICKABLE
   ========================================= */

document.addEventListener("click", function(e) {

  let element = e.target;

  while (
    element &&
    element !== document.body
  ) {

    const text =
      element.textContent
        ? element.textContent.trim()
        : "";

    const classNames =
      Object.keys(eduaiStudyData);

    for (const className of classNames) {

      if (
        text === className ||
        text.startsWith(className)
      ) {

        if (
          element.closest("#eduaiChatScreen") ||
          element.closest("#eduaiStudyScreen")
        ) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        openEduAIClass(className);

        return;
      }

    }

    element =
      element.parentElement;

  }

}, true);
