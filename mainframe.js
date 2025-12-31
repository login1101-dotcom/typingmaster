/* =========================
   mainframe.js (レイアウト修正版)
========================= */

let problems = [];
let currentIndex = 0;
let currentHira = "";
let currentRoma = "";
let displayRoma = "";

let isTestMode = false;
let currentLevel = "syokyu";
let timeLimit = 60;
let remainingTime = 0;
let timerInterval = null;
let isGameStarted = false;

let correctCount = 0;
let attemptedCount = 0;
let hasStartedTyping = false;

/* =========================
   UI制御
========================= */
function setUI(state) {
  // ヘッダー要素の取得（確実に存在するものとして扱う）
  const left = document.getElementById("uiLeft");
  const center = document.getElementById("uiCenter");
  const right = document.getElementById("uiRight");
  
  // 出題エリア要素
  const hira = document.getElementById("questionHira");
  const roma = document.getElementById("questionRoma");
  const cardPlaying = document.getElementById("questionCardPlaying");
  const cardFinished = document.getElementById("questionCardFinished");

  // 基本ボタン配置 (左と右)
  if(left) left.innerHTML = `<a href="index.html" class="btn-home">戻る</a>`;
  if(right) right.innerHTML = `<a href="results.html?level=${currentLevel}&time=${timeLimit}" class="btn-result">結果</a>`;

  /* ---------- before (開始前) ---------- */
  if (state === "before") {
    // 中央ヘッダーに配置（出題エリアではない！）
    if(center) {
        center.innerHTML = `
          <div class="top-center">
            <span>時間選択</span>
            <select id="timeSelect">${generateTimeOptions()}</select>
            <a href="#" id="startBtn" class="btn-start">スタート</a>
          </div>
        `;
        // イベントリスナー設定
        setTimeout(() => {
            const btn = document.getElementById("startBtn");
            if(btn) btn.onclick = startTest;
        }, 0);
    }

    // 出題エリアの表示
    if(hira) hira.textContent = "この箇所に問題が表示されます";
    if(roma) {
        roma.innerHTML = `
           <div style="
             font-size: 20px; 
             color: #fff; 
             background: #333; 
             padding: 10px 20px; 
             border: 2px solid #ff4444; 
             border-radius: 8px;
             display: inline-block;
             animation: flash-border-red 2s infinite;
             margin-top: 10px;
           ">
             スペースキーを押すとテストが開始されます
           </div>
        `;
    }
    
    if (cardPlaying) cardPlaying.style.display = "flex";
    if (cardFinished) cardFinished.style.display = "none";
    return;
  }

  /* ---------- during (テスト中) ---------- */
  if (state === "during") {
    // 中央ヘッダーはタイマー表示に切り替え
    if(center) center.innerHTML = `<span id="timerDisplay">残り時間 --:--</span>`;
    updateTimerDisplay();
    
    if (cardPlaying) cardPlaying.style.display = "flex";
    if (cardFinished) cardFinished.style.display = "none";
    return;
  }

  /* ---------- after (終了後) ---------- */
  if (state === "after") {
    const score = correctCount * 10;
    const accuracy = attemptedCount
      ? Math.floor((correctCount / attemptedCount) * 100)
      : 0;

    // 中央ヘッダーに結果表示
    if(center) {
        center.innerHTML = `
          <span>得点：${score}</span>
          <span style="margin-left:16px;">正解数：${correctCount}</span>
          <span style="margin-left:16px;">問題数：${attemptedCount}</span>
          <span style="margin-left:16px;">正解率：${accuracy}%</span>
        `;
    }

    if (cardPlaying) cardPlaying.style.display = "none";
    if (cardFinished) {
      cardFinished.style.display = "flex";
      cardFinished.innerHTML = `
        <div class="finish-text">Time Up!</div>
        <div class="retry-row">
          <a href="#" id="retrySame" class="btn-home">この条件で再テスト</a>
          <a href="mainframe.html?level=${currentLevel}&mode=test"
             class="btn-home">条件変更して再テスト</a>
        </div>
      `;
      // リトライボタンのイベント設定
      setTimeout(() => {
          const btn = document.getElementById("retrySame");
          if(btn) {
              btn.onclick = (e) => {
                e.preventDefault();
                retrySameCondition();
              };
          }
      }, 0);
    }
  }
}

/* =========================
   時間選択（10秒〜）
========================= */
function generateTimeOptions() {
  let html = "";
  for (let sec = 10; sec <= 50; sec += 10) {
    html += `<option value="${sec}">00:${sec}</option>`;
  }
  for (let min = 1; min <= 30; min++) {
    for (let sec = 0; sec < 60; sec += 10) {
      const t = min * 60 + sec;
      const sel = t === 60 ? "selected" : "";
      html += `<option value="${t}" ${sel}>${min
        .toString()
        .padStart(2, "0")}:${sec.toString().padStart(2, "0")}</option>`;
    }
  }
  return html;
}

/* =========================
   テスト開始
========================= */
function startTest() {
  const sel = document.getElementById("timeSelect");
  if (sel) {
    timeLimit = parseInt(sel.value);
  }
  remainingTime = timeLimit;
  correctCount = 0;
  attemptedCount = 0;
  currentIndex = 0;
  isGameStarted = true;

  setUI("during");

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    remainingTime--;
    updateTimerDisplay();
    if (remainingTime <= 0) endTest();
  }, 1000);

  showProblem();
}

/* =========================
   再テスト
========================= */
function retrySameCondition() {
  remainingTime = timeLimit;
  correctCount = 0;
  attemptedCount = 0;
  currentIndex = 0;
  isGameStarted = true;

  if (timerInterval) clearInterval(timerInterval);
  setUI("during");

  timerInterval = setInterval(() => {
    remainingTime--;
    updateTimerDisplay();
    if (remainingTime <= 0) endTest();
  }, 1000);

  showProblem();
}

/* =========================
   タイマー表示
========================= */
function updateTimerDisplay() {
  const m = Math.floor(remainingTime / 60);
  const s = remainingTime % 60;
  const el = document.getElementById("timerDisplay");
  if (el) {
    el.textContent = `残り時間 ${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  }
}

/* =========================
   テスト終了
========================= */
function endTest() {
  if (timerInterval) clearInterval(timerInterval);
  isGameStarted = false;
  sendToRebirth();
  setUI("after");
}

/* =========================
   Re:Birth連携
========================= */
function sendToRebirth() {
  if (localStorage.getItem('rebirthSync') !== 'enabled') return;
  const acc = attemptedCount ? (correctCount / attemptedCount) * 100 : 0;
  const wps = timeLimit > 0 ? correctCount / timeLimit : 0;
  let lv = '初級1';
  if (wps >= 4.0 && acc >= 95) lv = '上級';
  else if (currentLevel === 'tyukyu') lv = '中級';
  else if (currentLevel === 'jyokyu') lv = '上級';
  
  const d = { level: lv, time: timeLimit, count: 1, timestamp: new Date().toISOString() };
  try {
    const q = JSON.parse(localStorage.getItem('rebirthPracticeQueue') || '[]');
    q.push(d);
    localStorage.setItem('rebirthPracticeQueue', JSON.stringify(q));
    console.log('Re:Birth送信:', d);
  } catch(e) { console.error(e); }
}

/* =========================
   問題表示
========================= */
function showProblem() {
  if (!problems || problems.length === 0) return;
  const p = problems[currentIndex];
  currentHira = p.hira;
  displayRoma = p.roma;
  currentRoma = p.roma.replace(/\s+/g, "");
  hasStartedTyping = false;

  const h = document.getElementById("questionHira");
  const r = document.getElementById("questionRoma");
  if (h) h.textContent = currentHira;
  if (r) r.textContent = displayRoma;
}

/* =========================
   キー入力
========================= */
document.addEventListener("keydown", e => {
  if (e.code === "Space" && !isGameStarted && !isTestMode) {
     e.preventDefault();
     const sel = document.getElementById("timeSelect");
     if (sel) { startTest(); } 
     else { 
       const startBtn = document.getElementById("startBtn");
       if (startBtn) startBtn.click();
       else startTest(); // 強制開始
     }
     return;
  }

  if (isTestMode && !isGameStarted) return;
  if (!isGameStarted) return;

  const key = e.key.toLowerCase();
  if (key.length > 1) return; 
  if (!currentRoma) return;

  if (!hasStartedTyping) {
    attemptedCount++;
    hasStartedTyping = true;
  }

  if (currentRoma.startsWith(key)) {
    currentRoma = currentRoma.slice(1);
    const i = displayRoma.indexOf(key);
    if (i !== -1) {
      displayRoma = displayRoma.slice(0, i) + displayRoma.slice(i + 1);
    }
    document.getElementById("questionRoma").textContent = displayRoma;
    if (currentRoma.length === 0) {
      correctCount++;
      currentIndex = (currentIndex + 1) % problems.length;
      showProblem();
    }
  }
});

/* =========================
   初期化
========================= */
const params = new URLSearchParams(location.search);
isTestMode = params.get("mode") === "test";
currentLevel = params.get("level") || "syokyu";

async function loadProblems(level) {
  const file = level === "syokyu" ? "syokyu.txt" : level === "tyukyu" ? "tyukyu.txt" : "jyokyu.txt";
  try {
    const res = await fetch(file);
    const text = await res.text();
    problems = text.trim().split("\n").map(line => {
      const [h, r] = line.split(",");
      return { hira: h, roma: r };
    });
    setUI("before");
  } catch (err) { console.error("Error:", err); }
}

window.addEventListener("DOMContentLoaded", () => {
  loadProblems(currentLevel);
});
