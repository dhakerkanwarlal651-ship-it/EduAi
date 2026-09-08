 /* EDUAI INTERFACE FINAL - REPLACE ALL OLD CODE */

(function () {
  "use strict";

  const API = "/api/chat";

  function text(v) {
    return String(v || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function esc(v) {
    return String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function toast(msg) {
    let x = document.getElementById("eduaiToast");

    if (!x) {
      x = document.createElement("div");
      x.id = "eduaiToast";

      x.style.cssText =
        "position:fixed;" +
        "left:50%;" +
        "bottom:90px;" +
        "transform:translateX(-50%);" +
        "z-index:999999;" +
        "background:#087f75;" +
        "color:#fff;" +
        "padding:13px 18px;" +
        "border-radius:14px;" +
        "font:600 14px Arial;" +
        "box-shadow:0 6px 22px #0005;";

      document.body.appendChild(x);
    }

    x.textContent = msg;
    x.style.display = "block";

    clearTimeout(x._timer);

    x._timer = setTimeout(function () {
      x.style.display = "none";
    }, 2200);
  }

  function show(title, html) {
    const old = document.getElementById("eduaiModal");

    if (old) {
      old.remove();
    }

    const bg = document.createElement("div");

    bg.id = "eduaiModal";

    bg.style.cssText =
      "position:fixed;" +
      "inset:0;" +
      "z-index:999998;" +
      "background:#0009;" +
      "display:flex;" +
      "align-items:center;" +
      "justify-content:center;" +
      "padding:16px;";

    const box = document.createElement("div");

    box.style.cssText =
      "width:100%;" +
      "max-width:520px;" +
      "max-height:82vh;" +
      "overflow:auto;" +
      "background:#fff;" +
      "border-radius:22px;" +
      "padding:20px;";

    box.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;">' +

      '<h2 style="margin:0;color:#087f75;font:700 20px Arial">' +
      esc(title) +
      "</h2>" +

      '<button id="eduaiClose" ' +
      'style="border:0;background:#eef6f5;width:38px;height:38px;' +
      'border-radius:50%;font-size:25px;color:#087f75">×</button>' +

      "</div>" +

      '<div style="margin-top:14px;color:#333;font:15px/1.65 Arial">' +
      html +
      "</div>";

    bg.appendChild(box);

    document.body.appendChild(bg);

    document.getElementById("eduaiClose").onclick = function () {
      bg.remove();
    };

    bg.onclick = function (e) {
      if (e.target === bg) {
        bg.remove();
      }
    };
  }

  async function askAI(message) {
    if (!message || !message.trim()) {
      toast("पहले सवाल लिखें");
      return null;
    }

    toast("AI जवाब तैयार कर रहा है…");

    try {
      const r = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: message.trim()
        })
      });

      const d = await r.json().catch(function () {
        return {};
      });

      if (!r.ok) {
        throw new Error(d.error || "AI error");
      }

      return d.reply ||
        d.message ||
        d.answer ||
        "जवाब नहीं मिला।";

    } catch (e) {
      console.error(e);
      toast("AI से जुड़ने में समस्या हुई");
      return null;
    }
                            }
    function result(title, question, answer) {
    if (!answer) return;

    show(
      title,
      '<div style="background:#f3f9f8;padding:12px;border-radius:12px;margin-bottom:12px">' +
      "<b>सवाल:</b><br>" +
      esc(question) +
      "</div>" +
      '<div style="white-space:pre-wrap">' +
      esc(answer) +
      "</div>"
    );
  }

  async function topicExplain() {
    const q = prompt("कौन-सा Topic समझना है?");
    if (!q) return;

    const a = await askAI(
      "इस topic को student को आसान Hindi में step-by-step समझाओ, " +
      "उदाहरण और मुख्य points के साथ.\nTopic: " + q
    );

    result("💡 Topic समझाएँ", q, a);
  }

  async function makeNotes() {
    const q = prompt("किस topic के Notes बनाने हैं?");
    if (!q) return;

    const a = await askAI(
      "इस topic के exam-ready notes बनाओ. " +
      "Headings, definitions और important points दो.\nTopic: " + q
    );

    result("📝 Notes", q, a);
  }

  async function makeQuiz() {
    const q = prompt("किस topic का Quiz चाहिए?");
    if (!q) return;

    const a = await askAI(
      "इस topic पर 10 MCQ बनाओ. " +
      "हर question में 4 options और अंत में answer key दो.\nTopic: " + q
    );

    result("🧠 Quiz", q, a);
  }

  async function studyPlan() {
    const q = prompt("किस subject/topic के लिए Study Plan चाहिए?");
    if (!q) return;

    const a = await askAI(
      q +
      " के लिए 7 दिन का practical study plan बनाओ, " +
      "जिसमें study, revision और practice हो."
    );

    result("📅 Study Plan", q, a);
  }

  async function revision() {
    const q = prompt("किस topic की Revision करनी है?");
    if (!q) return;

    const a = await askAI(
      q +
      " की quick revision कराओ. Important facts, " +
      "definitions/formulas और 5 revision questions दो."
    );

    result("🔄 Revision", q, a);
  }

  async function practiceQuiz() {
    const q = prompt("Practice के लिए topic बताएं:");
    if (!q) return;

    const a = await askAI(
      q +
      " पर 10 question का practice test बनाओ, " +
      "4 options और answer key के साथ."
    );

    result("📝 Practice Quiz", q, a);
  }
    function voice() {
    const SR =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SR) {
      toast("इस browser में Voice उपलब्ध नहीं है");
      return;
    }

    const r = new SR();

    r.lang = "hi-IN";
    r.interimResults = false;
    r.maxAlternatives = 1;

    r.onstart = function () {
      toast("🎤 बोलिए…");
    };

    r.onerror = function () {
      toast("Voice input में समस्या हुई");
    };

    r.onresult = function (e) {
      const value =
        e.results[0][0].transcript;

      const fields =
        document.querySelectorAll(
          'input[type="text"], textarea, input:not([type])'
        );

      let target = null;

      fields.forEach(function (x) {
        if (!target && x.offsetParent !== null) {
          target = x;
        }
      });

      if (target) {
        target.value = value;

        target.dispatchEvent(
          new Event("input", {
            bubbles: true
          })
        );

        toast("आवाज़ से सवाल लिखा गया ✅");
      } else {
        toast("🎤 " + value);
      }
    };

    r.start();
  }

  function photo() {
    let input =
      document.getElementById(
        "eduaiPhotoInput"
      );

    if (!input) {
      input = document.createElement("input");

      input.id = "eduaiPhotoInput";
      input.type = "file";
      input.accept = "image/*";
      input.style.display = "none";

      document.body.appendChild(input);

      input.onchange = function () {
        const file =
          input.files && input.files[0];

        if (!file) return;

        const url =
          URL.createObjectURL(file);

        show(
          "📷 Photo Question",

          '<img src="' +
            url +
            '" style="' +
            "width:100%;" +
            "max-height:280px;" +
            "object-fit:contain;" +
            "border-radius:14px;" +
            "background:#f5f5f5" +
            '">' +

          "<p>" +
          "Photo select हो गई है।" +
          "</p>" +

          '<button id="photoUse" ' +
          'style="' +
          "width:100%;" +
          "border:0;" +
          "background:#087f75;" +
          "color:#fff;" +
          "padding:13px;" +
          "border-radius:12px;" +
          "font-weight:700;" +
          '">' +
          "AI Tutor में खोलें" +
          "</button>"
        );

        const b =
          document.getElementById(
            "photoUse"
          );

        if (b) {
          b.onclick = function () {
            toast(
              "Photo AI Tutor में upload करें"
            );

            const chatPhoto =
              document.getElementById(
                "chatPhoto"
              );

            if (chatPhoto) {
              const modal =
                document.getElementById(
                  "eduaiModal"
                );

              if (modal) {
                modal.remove();
              }

              chatPhoto.click();
            }
          };
        }
      };
    }

    input.value = "";
    input.click();
  }

  function profile() {
    show(
      "👤 EduAI Profile",

      "<b>Student Profile</b>" +
      "<br><br>" +
      "अपनी class, board और subjects " +
      "चुनकर personalised study शुरू करें।"
    );
  }

  function language() {
    toast("Hindi / English");
  }

  function courses() {
    if (
      typeof window.openEduAIClass ===
      "function"
    ) {
      window.openEduAIClass(
        "Class 1-5"
      );
    } else {
      toast(
        "Courses अभी load हो रहे हैं"
      );
    }
  }

  function tutor() {
    if (
      typeof window.createChatScreen ===
      "function"
    ) {
      window.createChatScreen();
    } else {
      const el =
        [...document.querySelectorAll(
          "button,a,[role='button']"
        )].find(function (x) {
          return text(
            x.innerText ||
            x.textContent
          ).includes("ai tutor");
        });

      if (el) {
        el.click();
      } else {
        toast(
          "AI Tutor नहीं खुल पाया"
        );
      }
    }
  }

  function home() {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
}
    function action(label, el) {
    const t = text(label);

    if (
      el.closest("#eduaiStudyScreen")
    ) {
      return false;
    }

    if (
      t.includes("topic समझाएँ") ||
      t.includes("topic samjha") ||
      t.includes("explain topic")
    ) {
      topicExplain();
      return true;
    }

    if (
      t.includes("notes बनाएं") ||
      t.includes("notes bana") ||
      t.includes("make notes")
    ) {
      makeNotes();
      return true;
    }

    if (
      t.includes("quiz बनाएं") ||
      t.includes("quiz bana") ||
      t.includes("make quiz")
    ) {
      makeQuiz();
      return true;
    }

    if (
      t.includes("study plan") ||
      t.includes("studyplan") ||
      t.includes("स्टडी प्लान")
    ) {
      studyPlan();
      return true;
    }

    if (
      t.includes("revision") ||
      t.includes("रिविजन") ||
      t.includes("रिवीजन")
    ) {
      revision();
      return true;
    }

    if (
      t.includes("practice quiz") ||
      t === "practice" ||
      t.includes("प्रैक्टिस")
    ) {
      practiceQuiz();
      return true;
    }

    if (
      t.includes("photo question") ||
      t.includes("फोटो question") ||
      t === "photo" ||
      t.includes("फोटो")
    ) {
      photo();
      return true;
    }

    return false;
  }

  function connect() {
    if (window.__eduaiFinalConnected) {
      return;
    }

    window.__eduaiFinalConnected = true;

    document.addEventListener(
      "click",
      function (e) {
             const el = e.target.closest(
          "button,a,[role='button'],.card,.chip,.tool-card,.quick-action"
        );

        if (!el) {
          return;
        }

        const label =
          (el.innerText ||
            el.textContent ||
            "") +
          " " +
          (el.getAttribute(
            "aria-label"
          ) || "");

        const t = text(label);

        /* MIC / VOICE */

        if (
          t.includes("mic") ||
          t.includes("voice") ||
          t.includes("माइक")
        ) {

          if (
            el.id === "chatMic" ||
            el.id === "micBtn" ||
            el.closest("#eduaiChatScreen")
          ) {
            return;
          }

          e.preventDefault();
          e.stopImmediatePropagation();

          voice();
          return;
        }

        /* LANGUAGE */

        if (
          t === "हि" ||
          t === "हिंदी" ||
          t.includes("language")
        ) {

          e.preventDefault();

          language();
          return;
        }

        /* HOME */

        if (
          t === "home" ||
          t.includes("होम")
        ) {

          home();
          return;
        }

        /* COURSES */

        if (
          t === "courses" ||
          t.includes("कोर्स")
        ) {

          e.preventDefault();
          e.stopImmediatePropagation();

          courses();
          return;
        }

        /* AI TUTOR */

        if (
          t === "ai tutor" ||
          t.includes("ai tutor")
        ) {

          e.preventDefault();
          e.stopImmediatePropagation();

          tutor();
          return;
        }

        /* PROFILE */

        if (
          t === "profile" ||
          t.includes("प्रोफाइल")
        ) {

          e.preventDefault();

          profile();
          return;
        }

        /* QUICK ACTIONS */

        if (
          action(label, el)
        ) {

          e.preventDefault();
          e.stopImmediatePropagation();

          return;
        }

      },
      true
    );

    window.EduAIInterface = {

      toast: toast,

      askAI: askAI,

      topicExplain: topicExplain,

      makeNotes: makeNotes,

      makeQuiz: makeQuiz,

      studyPlan: studyPlan,

      revision: revision,

      practiceQuiz: practiceQuiz,

      startVoice: voice,

      photoQuestion: photo,

      languageToggle: language,

      profile: profile,

      openCourses: courses,

      openAITutor: tutor

    };

    console.log(
      "EduAI FINAL INTERFACE LOADED ✅"
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      connect,
      {
        once: true
      }
    );

  } else {

    connect();

  }

})();
