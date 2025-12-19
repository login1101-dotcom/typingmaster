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
   UI補助CSS（JSのみで注入：inline style排除）
========================= */
function ensureUIStyles() {
  if (document.getElementById("tmn-ui-style")) return;

  const style = document.createElement("style");
  style.id = "tmn-ui-style";
  style.textContent = `
    .tmn-before-row {
      display: flex;
      align-items: center;
      gap: 12px;
      justify-content: center;
      white-space: nowrap;
    }
    .tmn-after-center {
      display: inline-flex;
      align-items: center;
      gap: 16px;
      justify-content: center;
      white-space: nowrap;
    }
    .tmn-retry-row {
      margin-top: 24px;
      display: flex;
      gap: 16px;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
    }
  `;
  document.head.appendChild(style);
}

/* =========================
   UI制御（修正版）
   - state遷移後も topBar を消さない
   - topBar は topBar のみ更新
   - 本文（questionHira / questionRoma）は終了時のみ更新
   - inline style を使わない
========================= */
function setUI(state) {
  ensureUIStyles();

  const left = document.getElementById("uiLeft");
  const center = document.getElementById("uiCenter");
  const right = document.getElementById("uiRight");

  // 左右は常に固定
  left.innerHTML = `<a href="index.html" class="btn-home">戻る</a>`;
  right.innerHTML = `<a href="results.html?level=${currentLevel}&time=${timeLimit}" class="btn-result">結果</a>`;
  center.innerHTML = "";

  if (state === "before") {
    center.innerHTML = `
      <div class="tmn-before-row">
        <span>時間選択</span>
        <select id="timeSelect">${generateTimeOptions()}</select>
        <button id="startBtn" class="btn-start">スタート</button>
      </div>
    `;
    document.getElementById("startBtn").onclick = startTest;

    // 本文は空（開始前）
    document.getElementById("questionHira").textContent = "";
    document.getElementById("questionRoma").textContent = "";
    return;
  }

  if (state === "during") {
    center.innerHTML = `<span id="timerDisplay"></span>`;
    updateTimerDisplay();
    return;
  }

  if (state === "after") {
    const score = correctCount * 10;
    const accuracy = attemptedCount
      ? Math.floor((correctCount / attemptedCount) * 100)
      : 0;

    // グレーのバー中央：スコア表示
    center.innerHTML = `
      <span class="tmn-after-center">
        <span>得点：${score}</span>
        <span>正解数：${correctCount}</span>
        <span>問題数：${attemptedCount}</span>
        <span>正解率：${accuracy}%</span>
      </span>
    `;

    // 本文側：終了メッセージはCSS疑似要素に任せる（空にする）
    document.getElementById("questionHira").textContent = "";

    // 本文側：再テストUI（出題エリア直下）
    const roma = document.getElementById("questionRoma");
    roma.innerHTML = `
      <div class="tmn-retry-row">
        <button id="retrySame" class="btn-home">この条件で再テスト</button>
        <a href="mainframe.html?level=${currentLevel}&mode=test" class="btn-home">条件変更して再テスト</a>
      </div>
    `;

    document.getElementById("retrySame").onclick = () => {
      remainingTime = timeLimit;
      correctCount = 0;
      attemptedCount = 0;
      currentIndex = 0;
      isGameStarted = true;

      clearInterval(timerInterval);
      setUI("during");

      timerInterval = setInterval(() => {
        remainingTime--;
        updateTimerDisplay();
        if (remainingTime <= 0) endTest();
      }, 1000);

      showProblem();
    };
  }
}

/* =========================
   時間選択
========================= */
function generateTimeOptions() {
  let html = "";
  for (let sec = 1; sec <= 9; sec++) {
    html += `<option value="${sec}">00:0${sec}</option>`;
  }
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
    el.textContent = `残り時間 ${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
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
    level === "syokyu"
      ? "syokyu.txt"
      : level === "tyukyu"
      ? "tyukyu.txt"
      : "jyokyu.txt";

  const res = await fetch(file);
  const text = await res.text();

  problems = text.trim().split("\n").map(line => {
    const [h, r] = line.split(",");
    return { hira: h, roma: r };
  });

  setUI(isTestMode ? "before" : "during");
  showProblem();
}

window.addEventListener("DOMContentLoaded", () => {
  loadProblems(currentLevel);
});
