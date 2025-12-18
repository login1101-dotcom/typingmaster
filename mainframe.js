let problems = [];
let currentIndex = 0;
let currentHira = "";
let currentRoma = "";
let displayRoma = "";

// テスト用
let isTestMode = false;
let currentLevel = "syokyu";
let timeLimit = 60;
let remainingTime = 0;
let timerInterval = null;
let isGameStarted = false;
let correctCount = 0;
let totalQuestions = 0;

/* ===== UI制御（グレー帯） ===== */
function setUI(state) {
  const left = document.getElementById("uiLeft");
  const center = document.getElementById("uiCenter");
  const right = document.getElementById("uiRight");

  left.innerHTML = "";
  center.innerHTML = "";
  right.innerHTML = "";

  /* ===== 開始前：中央にまとめる ===== */
  if (state === "before") {
    center.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;justify-content:center;">
        <span style="font-size:16px;font-weight:bold;">制限時間を選択</span>
        <select id="timeSelect" style="font-size:18px;padding:4px;">
          ${generateTimeOptions()}
        </select>
        <button class="btn-start" id="startBtn">スタート</button>
      </div>
    `;
    document.getElementById("startBtn").onclick = startTest;
  }

  /* ===== テスト中 ===== */
  if (state === "during") {
    left.textContent = "テスト中";
    center.innerHTML = `<span id="timerDisplay"></span>`;
    right.innerHTML = `
      <a class="btn-home" href="index.html">戻る</a>
      <a class="btn-result" id="resultsBtn" href="#">結果</a>
    `;
    updateTimerDisplay();
  }

  /* ===== テスト終了：結果表示 ===== */
  if (state === "after") {
    const score = correctCount * 10;

    left.textContent = "テスト終了";
    center.innerHTML = `
      <div style="font-size:18px;font-weight:bold;">
        得点：${score}　
        正解数：${correctCount}　
        実施数：${totalQuestions}
      </div>
    `;
    right.innerHTML = `
      <a class="btn-home" href="index.html">戻る</a>
      <a class="btn-result" href="results.html?level=${currentLevel}&time=${timeLimit}">結果</a>
    `;
  }
}

/* ===== 時間選択肢 ===== */
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

/* ===== テスト開始 ===== */
function startTest() {
  timeLimit = parseInt(document.getElementById("timeSelect").value);
  remainingTime = timeLimit;
  correctCount = 0;
  currentIndex = 0;
  isGameStarted = true;

  setUI("during");

  document.getElementById("resultsBtn").href =
    `results.html?level=${currentLevel}&time=${timeLimit}`;

  timerInterval = setInterval(() => {
    remainingTime--;
    updateTimerDisplay();
    if (remainingTime <= 0) endTest();
  }, 1000);

  showProblem();
}

/* ===== タイマー表示 ===== */
function updateTimerDisplay() {
  const m = Math.floor(remainingTime / 60);
  const s = remainingTime % 60;
  const el = document.getElementById("timerDisplay");
  if (el) {
    el.textContent = `残り時間 ${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
}

/* ===== テスト終了 ===== */
function endTest() {
  clearInterval(timerInterval);
  isGameStarted = false;

  saveTestResult(timeLimit, correctCount * 10);
  setUI("after");

  document.getElementById("questionHira").textContent = "";
  document.getElementById("questionRoma").textContent = "";
}

/* ===== 結果保存 ===== */
function saveTestResult(time, score) {
  const list = JSON.parse(localStorage.getItem("typingTestResults") || "[]");
  list.push({
    date: new Date().toISOString(),
    level: currentLevel,
    timeLimit: time,
    score: score,
    correct: correctCount,
    total: totalQuestions
  });
  localStorage.setItem("typingTestResults", JSON.stringify(list));
}

/* ===== 問題ロード ===== */
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

  totalQuestions = problems.length;
  currentIndex = 0;

  setUI(isTestMode ? "before" : "during");
  showProblem();
}

/* ===== 問題表示 ===== */
function showProblem() {
  if (!isTestMode || isGameStarted) {
    const p = problems[currentIndex];
    currentHira = p.hira;
    displayRoma = p.roma;
    currentRoma = p.roma.replace(/\s+/g, "");

    document.getElementById("questionHira").textContent = currentHira;
    document.getElementById("questionRoma").textContent = displayRoma;
  }
}

/* ===== 入力判定 ===== */
document.addEventListener("keydown", e => {
  if (isTestMode && !isGameStarted) return;

  const key = e.key.toLowerCase();
  if (!currentRoma || key === " ") return;

  if (currentRoma.startsWith(key)) {
    currentRoma = currentRoma.slice(1);

    const i = displayRoma.indexOf(key);
    if (i !== -1) {
      displayRoma = displayRoma.slice(0, i) + displayRoma.slice(i + 1);
    }
    document.getElementById("questionRoma").textContent = displayRoma;

    if (currentRoma.length === 0) {
      if (isTestMode) correctCount++;
      currentIndex = (currentIndex + 1) % problems.length;
      showProblem();
    }
  }
});

/* ===== 初期化 ===== */
const params = new URLSearchParams(location.search);
isTestMode = params.get("mode") === "test";
currentLevel = params.get("level") || "syokyu";

loadProblems(currentLevel);
