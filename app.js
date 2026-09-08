const q=document.getElementById("question"), ask=document.getElementById("askBtn"), answer=document.getElementById("answer"), photo=document.getElementById("photoInput");
const samples=[
["Photosynthesis","Photosynthesis वह प्रक्रिया है जिसमें हरे पौधे सूर्य के प्रकाश की मदद से पानी और carbon dioxide से अपना भोजन बनाते हैं।","Concept को 3 steps में याद रखें: Light → Water + CO₂ → Food + Oxygen."],
["गणित","सबसे पहले सवाल में दिए गए values और पूछा गया quantity पहचानें। फिर सही formula लगाकर step-by-step calculation करें।","अगर आप असली सवाल भेजेंगे, तो इसी जगह उसका पूरा solution दिखाया जा सकता है।"],
["संविधान","भारत का संविधान देश की शासन-व्यवस्था, नागरिकों के अधिकार और सरकार की शक्तियों का मूल कानूनी ढांचा है।","Practice के लिए Fundamental Rights, DPSP और Fundamental Duties से शुरुआत करें।"]
];
function showAnswer(text){
  const found=samples.find(x=>text.toLowerCase().includes(x[0].toLowerCase()));
  const title=found?found[0]:"आपके सवाल का जवाब";
  const body=found?found[1]:"यह EduAI का working demo है। अभी यह sample educational response दिखाता है। Real AI जोड़ने पर आपका सवाल AI model को भेजकर dynamic उत्तर मिलेगा।";
  const tip=found?found[2]:"आप follow-up question पूछकर topic को और आसान भाषा में समझ सकते हैं।";
  answer.className="answer";
  answer.innerHTML=`<div class="question-label">AI TUTOR</div><div class="answer-title">${escapeHtml(title)}</div><div class="answer-text">${escapeHtml(body)}</div><p style="margin-top:12px;color:#687572"><b>Quick tip:</b> ${escapeHtml(tip)}</p><span class="tag">Hindi + English</span><span class="tag">Step-by-step</span>`;
  answer.scrollIntoView({behavior:"smooth",block:"center"});
}
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
ask.onclick=()=>{const text=q.value.trim(); if(text)showAnswer(text); else {q.focus();q.placeholder="पहले अपना सवाल लिखें…"}};
q.addEventListener("keydown",e=>{if(e.key==="Enter")ask.click()});
document.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{q.value=b.dataset.q;ask.click()});
document.querySelectorAll(".course").forEach(b=>b.onclick=()=>{q.value=`${b.dataset.course} के लिए मुझे पढ़ाई शुरू करने का आसान plan और important topics बताओ`;ask.click()});
document.getElementById("photoTool").onclick=()=>photo.click();
photo.onchange=()=>{if(photo.files.length){showAnswer("Photo question"); answer.querySelector(".answer-title").textContent="Photo Question"; answer.querySelector(".answer-text").textContent="Photo select हो गई है। Real image-understanding AI जोड़ने पर photo के अंदर का सवाल पढ़कर उसका solution यहाँ दिखाया जाएगा."}};
document.getElementById("langBtn").onclick=()=>{document.getElementById("langBtn").textContent=document.getElementById("langBtn").textContent==="हि"?"EN":"हि"};
document.querySelectorAll(".nav").forEach(n=>n.onclick=()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));n.classList.add("active"); if(n.dataset.page==="tutor"){document.getElementById("question").focus()} else if(n.dataset.page==="courses"){document.querySelector(".course-grid").scrollIntoView({behavior:"smooth"})} else if(n.dataset.page==="practice"){q.value="मुझे 10 questions का practice quiz बनाओ";ask.click()} else if(n.dataset.page==="profile"){showAnswer("Profile"); answer.querySelector(".answer-title").textContent="Student Profile"; answer.querySelector(".answer-text").textContent="Profile, progress, streak और saved notes की screen यहाँ जोड़ी जा सकती है."}});
