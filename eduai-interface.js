(function () {
  "use strict";

  // ==============================
  // EDUAI INTERFACE - START
  // ==============================

  function escapeHTML(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function toast(message) {
    let old = document.getElementById("eduaiToast");
    if (old) old.remove();

    const div = document.createElement("div");
    div.id = "eduaiToast";
    div.textContent = message;

    div.style.cssText = `
      position:fixed;
      left:50%;
      bottom:90px;
      transform:translateX(-50%);
      background:#087f75;
      color:white;
      padding:12px 18px;
      border-radius:25px;
      z-index:99999;
      font-size:14px;
      box-shadow:0 6px 20px rgba(0,0,0,.25);
    `;

    document.body.appendChild(div);

    setTimeout(() => {
      div.remove();
    }, 2500);
  }

  function showMessage(title, text) {
    const old = document.getElementById("eduaiFeatureModal");
    if (old) old.remove();

    const modal = document.createElement("div");
    modal.id = "eduaiFeatureModal";

    modal.innerHTML = `
      <div style="
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.55);
        z-index:99998;
        display:flex;
        align-items:flex-end;
        justify-content:center;
      ">
        <div style="
          width:100%;
          max-width:520px;
          background:white;
          border-radius:24px 24px 0 0;
          padding:22px;
          max-height:80vh;
          overflow:auto;
        ">
          <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:15px;
          ">
            <h2 style="margin:0;color:#087f75;">
              ${escapeHTML(title)}
            </h2>

            <button id="eduaiModalClose" style="
              border:0;
              background:#eef5f4;
              width:38px;
              height:38px;
              border-radius:50%;
              font-size:20px;
            ">×</button>
          </div>

          <div style="
            color:#333;
            line-height:1.7;
            white-space:pre-wrap;
          ">${escapeHTML(text)}</div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document
      .getElementById("eduaiModalClose")
      .addEventListener("click", () => modal.remove());
  }

  // ==============================
  // AI REQUEST
  // ==============================

  async function askEduAI(message) {
    if (!message || !message.trim()) {
      toast("पहले अपना सवाल लिखें");
      return null;
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: message.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI response failed");
      }

      return data.reply || data.message || "AI ने कोई उत्तर नहीं दिया।";

    } catch (error) {
      console.error("EduAI Error:", error);
      toast("AI से कनेक्शन नहीं हो पाया");
      return null;
    }
  }

  // ==============================
  // TOPIC EXPLAIN
  // ==============================

  async function topicExplain() {
    const topic = prompt("किस topic को समझना है?");

    if (!topic || !topic.trim()) return;

    toast("AI topic समझा रहा है...");

    const answer = await askEduAI(
      `मुझे "${topic}" को आसान हिंदी में समझाओ। 
पहले basic concept बताओ, फिर step-by-step explanation दो, 
उदाहरण दो और अंत में important points बताओ।`
    );

    if (answer) {
      showMessage("💡 Topic Explanation", answer);
    }
  }

  // ==============================
  // NOTES
  // ==============================

  async function makeNotes() {
    const topic = prompt("किस topic के notes बनाने हैं?");

    if (!topic || !topic.trim()) return;

    toast("Notes तैयार हो रहे हैं...");

    const answer = await askEduAI(
      `"${topic}" के अच्छे और परीक्षा उपयोगी notes बनाओ।
Headings, important points, definitions और examples शामिल करो।
भाषा आसान हिंदी रखो।`
    );

    if (answer) {
      showMessage("📝 Study Notes", answer);
    }
  }

  // ==============================
  // QUIZ
  // ==============================

  async function makeQuiz() {
    const topic = prompt("किस topic का quiz चाहिए?");

    if (!topic || !topic.trim()) return;

    toast("Quiz बनाया जा रहा है...");

    const answer = await askEduAI(
      `"${topic}" पर 10 MCQ questions बनाओ।
हर question के 4 options हों और सही answer भी बताओ।`
    );

    if (answer) {
      showMessage("🧠 AI Quiz", answer);
    }
  }

  // ==============================
  // STUDY PLAN
  // ==============================

  async function studyPlan() {
    const subject = prompt("किस subject/topic के लिए study plan चाहिए?");

    if (!subject || !subject.trim()) return;

    toast("Study plan तैयार हो रहा है...");

    const answer = await askEduAI(
      `"${subject}" के लिए एक practical student study plan बनाओ।
Daily schedule, revision, practice और test शामिल करो।`
    );

    if (answer) {
      showMessage("📅 Study Plan", answer);
    }
  }

  // ==============================
  // REVISION
  // ==============================

  async function revision() {
    const topic = prompt("किस topic का revision करना है?");

    if (!topic || !topic.trim()) return;

    toast("Revision material तैयार हो रहा है...");

    const answer = await askEduAI(
      `"${topic}" का quick revision कराओ।
Important definitions, formulas, facts और exam points बताओ।`
    );

    if (answer) {
      showMessage("🔄 Revision", answer);
    }
  }

  // ==============================
  // PRACTICE QUIZ
  // ==============================

  async function practiceQuiz() {
    const topic = prompt("किस topic की practice करनी है?");

    if (!topic || !topic.trim()) return;

    toast("Practice questions बन रहे हैं...");

    const answer = await askEduAI(
      `"${topic}" पर practice के लिए 10 questions बनाओ।
Easy से शुरू करके धीरे-धीरे difficult करो।`
    );

    if (answer) {
      showMessage("🎯 Practice", answer);
    }
  }

  // ==============================
  // VOICE SEARCH
  // ==============================

  function startVoice() {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast("इस browser में voice feature उपलब्ध नहीं है");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = function () {
      toast("🎙️ बोलिए...");
    };

    recognition.onresult = function (event) {
      const text = event.results[0][0].transcript;

      const input =
        document.querySelector(
          'input[placeholder*="सवाल"], textarea[placeholder*="सवाल"], input[placeholder*="question"], textarea[placeholder*="question"]'
        );

      if (input) {
        input.value = text;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        toast("सवाल लिख दिया गया");
      } else {
        showMessage("🎙️ आपका सवाल", text);
      }
    };

    recognition.onerror = function () {
      toast("Voice input नहीं मिला");
    };

    recognition.start();
  }

  // ==============================
  // PHOTO QUESTION
  // ==============================

  function photoQuestion() {
    let input = document.getElementById("eduaiPhotoInput");

    if (!input) {
      input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment";
      input.id = "eduaiPhotoInput";
      input.style.display = "none";

      document.body.appendChild(input);

      input.addEventListener("change", function () {
        const file = input.files && input.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = function (event) {
          const preview = document.createElement("div");

          preview.innerHTML = `
            <img src="${event.target.result}" style="
              max-width:100%;
              max-height:280px;
              border-radius:15px;
              margin-bottom:15px;
            ">
          `;

          showMessage(
            "📷 Photo Question",
            "Photo select हो गई है। अब इस question को AI से समझने के लिए नीचे AI Tutor में भेजें।"
          );
        };

        reader.readAsDataURL(file);
      });
    }

    input.click();
  }

  // ==============================
  // LANGUAGE
  // ==============================

  function languageToggle() {
    const current =
      localStorage.getItem("eduai-language") || "hi";

    const next = current === "hi" ? "en" : "hi";

    localStorage.setItem("eduai-language", next);

    toast(
      next === "hi"
       localStorage.setItem("eduai-language", next);

    toast(
      next === "hi"
        ? "हिंदी भाषा चुनी गई"
        : "English language selected"
    );
  }

  // ==============================
  // PROFILE
  // ==============================

  function profile() {
    showMessage(
      "👤 Profile",
      "EduAI Student Profile\n\n" +
      "📚 Courses\n" +
      "📝 Notes\n" +
      "🧠 Quiz History\n" +
      "📊 Progress\n" +
      "🎯 Study Goals"
    );
  }

  // ==============================
  // COURSES
  // ==============================

  function openCourses() {
    if (typeof window.openEduAIClass === "function") {
      window.openEduAIClass("Class 1-5");
    } else {
      showMessage(
        "📚 Courses",
        "Courses section loading..."
      );
    }
  }

  // ==============================
  // GLOBAL ACCESS
  // ==============================

  window.EduAIInterface = {
    toast,
    askEduAI,
    topicExplain,
    makeNotes,
    makeQuiz,
    studyPlan,
    revision,
    practiceQuiz,
    photoQuestion,
    startVoice,
    languageToggle,
    profile,
    openCourses
  };

  console.log("EduAI Interface Loaded ✅");

})();
// ==========================================
// EDUAI BUTTON CONNECTION
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

  function connectButton(words, action) {
    const elements = document.querySelectorAll("button, .card, .chip, a");

    elements.forEach(function (el) {

      if (el.dataset.eduaiConnected === "1") return;

      const text = (el.innerText || el.textContent || "")
        .trim()
        .toLowerCase();

      if (!text) return;

      const found = words.some(function (word) {
        return text.includes(word.toLowerCase());
      });

      if (found) {
        el.dataset.eduaiConnected = "1";

        el.addEventListener("click", function (event) {
          event.preventDefault();

          try {
            action();
          } catch (error) {
            console.error("EduAI Button Error:", error);
          }
        });
      }
    });
  }

  // Topic समझाएँ
  connectButton(
    ["topic समझाएँ", "topic samjhayen", "topic samjhao"],
    function () {
      window.EduAIInterface.topicExplain();
    }
  );

  // Notes
  connectButton(
    ["notes बनाएं", "notes banaye", "notes"],
    function () {
      window.EduAIInterface.makeNotes();
    }
  );

  // Quiz
  connectButton(
    ["quiz बनाएं", "quiz banaye", "quiz"],
    function () {
      window.EduAIInterface.makeQuiz();
    }
  );

  // Study Plan
  connectButton(
    ["study plan", "studyplan"],
    function () {
      window.EduAIInterface.studyPlan();
    }
  );

  // Revision
  connectButton(
    ["revision", "रिविजन"],
    function () {
      window.EduAIInterface.revision();
    }
  );

  // Practice Quiz
  connectButton(
    ["practice quiz", "practice"],
    function () {
      window.EduAIInterface.practiceQuiz();
    }
  );

  // Photo Question
  connectButton(
    ["photo question", "photo", "फोटो"],
    function () {
      window.EduAIInterface.photoQuestion();
    }
  );

  // Voice / microphone
  document.querySelectorAll("button").forEach(function (button) {

    const label = (
      button.innerText ||
      button.getAttribute("aria-label") ||
      ""
    ).toLowerCase();

    if (
      label.includes("mic") ||
      label.includes("voice") ||
      label.includes("माइक")
    ) {
      button.addEventListener("click", function () {
        window.EduAIInterface.startVoice();
      });
    }
  });

  console.log("EduAI Buttons Connected ✅");

});
