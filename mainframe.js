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
   UI制御（完全統一版）
========================= */
function setUI(state) {
  const left = document.getElementById("uiLeft");
  const center = document.getElementById("uiCenter");
  const right = document.getElementById("uiRight");

  left.innerHTML = "";
  center.innerHTML = "";
  right.innerHTML = "";

  // ★ 右側UIは常にここ（位置固定）
  function renderRightButtons(showResult) {
    right.innerHTML = `
      <a href="index.html" class="btn-home">戻る</a>
      ${showResult ? `<a href="results.html?level=${currentLevel}&time=${timeLimit}" class="btn-result">結果</a>` : ""}
    `;
  }

  if (state === "before") {
    center.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;justify-content:center;">
        <span style="font-size:18px;font-weight:bold;">制限時間を選択</span>
        <select id="timeSelect">${generateTimeOptions()}</select>
        <button id="startBtn" class="btn-start">スタート</button>
      </div>
    `;
    document.getElementById("startBtn").onclick = startTest;
  }

  if (state === "during") {
    left.textContent = "テスト中";
    center.innerHTML = `<span id="timerDisplay"></span>`;
    renderRightButtons(true);
    updateTimerDisplay();
  }

  if (state === "after") {
    const score = correctCount * 10;
    const accuracy =
      attemptedCount > 0
        ? Math.floor((correctCount / attemptedCount) * 100)
        : 0;

    center.innerHTML = `
      <div>
        得点：${score}　
        正解数：${correctCount}　
        実施数：${attemptedCount}　
        正解率：${accuracy}%
      </div>
    `;
    renderRightButtons(true);
  }
}

/* =========================
   時間選択
========================= */
function generateTimeOptions() {
  let html = "";
  for (let sec = 10; sec <= 50; sec += 10) {
    html += `<option value="${sec}">00:${sec.toString().padStart(2, "0")}</option>`;
  }
  for (let min = 1; min <= 30; min++) {
    for (let sec = 0; sec < 60; sec += 10) {
      const t = min * 60 + sec;
      const sel = t === 60 ? "selected" : "";
      html += `<option value="${t}" ${sel}>${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}</option>`;
      if (min === 30 && sec === 0) break;
    }
  }
  return html;
}

/* =========================
   テスト開始
========================= */
function startTest() {
  timeLimit = parseInt(document.getElementById("timeSelect").value);
  remainingTime = timeLimit;
  correctCount = 0;
  attemptedCount = 0;
  currentIndex = 0;
  isGameStarted = true;

  setUI("during");

  timerInterval = setInterval(() => {
    remainingTime--;
    updateTimerDisplay();
    if (remainingTime <= 0) endTest();
  }, 1000);

  showProblem();
}

/* =========================
   タイマー
========================= */
function updateTimerDisplay() {
  const m = Math.floor(remainingTime / 60);
  const s = remainingTime % 60;
  const el = document.getElementById("timerDisplay");
  if (el) {
    el.textContent = `残り時間 ${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
}

/* =========================
   テスト終了
========================= */
function endTest() {
  clearInterval(timerInterval);
  isGameStarted = false;
  setUI("after");

  document.getElementById("questionHira").textContent = "";
  document.getElementById("questionRoma").textContent = "";
}

/* =========================
   問題表示
========================= */
function showProblem() {
  const p = problems[currentIndex];
  currentHira = p.hira;
  displayRoma = p.roma;
  currentRoma = p.roma.replace(/\s+/g, "");
  hasStartedTyping = false;

  document.getElementById("questionHira").textContent = currentHira;
  document.getElementById("questionRoma").textContent = displayRoma;
}

/* =========================
   入力処理
========================= */
document.addEventListener("keydown", e => {
  if (isTestMode && !isGameStarted) return;

  const key = e.key.toLowerCase();
  if (!currentRoma || key === " ") return;

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
  const file =
    level === "syokyu" ? "syokyu.txt" :
    level === "tyukyu" ? "tyukyu.txt" :
    "jyokyu.txt";

  const res = await fetch(file);
  const text = await res.text();

  problems = text.trim().split("\n").map(line => {
    const [h, r] = line.split(",");
    return { hira: h, roma: r };
  });

  setUI(isTestMode ? "before" : "during");
  showProblem();
}

loadProblems(currentLevel);
