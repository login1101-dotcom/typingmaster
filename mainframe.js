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

/* ===== UI制御 ===== */
function setUI(state) {
  const left = document.getElementById("uiLeft");
  const center = document.getElementById("uiCenter");
  const right = document.getElementById("uiRight");

  left.innerHTML = "";
  center.innerHTML = "";
  right.innerHTML = "";

  if (state === "before") {
    left.textContent = "制限時間を選択";
    center.innerHTML = `
      <select id="timeSelect" style="font-size:18px;padding:4px;">
        ${generateTimeOptions()}
      </select>
    `;
    right.innerHTML = `<button class="btn-start" id="startBtn">スタート</button>`;
    document.getElementById("startBtn").onclick = startTest;
  }

  if (state === "during") {
    left.textContent = "テスト中";
    center.innerHTML = `<span id="timerDisplay"></span>`;
    right.innerHTML = `
      <a class="btn-home" href="index.html">戻る</a>
      <a class="btn-result" id="resultsBtn" href="#">結果</a>
    `;
    updateTimerDisplay();
  }

  if (state === "after") {
    left.textContent = "テスト終了";
    center.textContent = "お疲れさまでした";
    right.innerHTML = `
      <a class="btn-home" href="index.html">戻る</a>
      <a class="btn-result" href="results.html">結果</a>
    `;
  }
}

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

/* ===== テスト処理 ===== */
function startTest() {
  timeLimit = parseInt(document.getElementById("timeSelect").value);
  remainingTime = timeLimit;
  correctCount = 0;
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

function updateTimerDisplay() {
  const m = Math.floor(remainingTime / 60);
  const s = remainingTime % 60;
  const el = document.getElementById("timerDisplay");
  if (el) {
    el.textContent = `残り時間 ${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
}

function endTest() {
  clearInterval(timerInterval);
  isGameStarted = false;
  saveTestResult(timeLimit, correctCount * 10);
  setUI("after");

  document.getElementById("questionHira").textContent = "お疲れ様でした";
  document.getElementById("questionRoma").textContent = "テスト終了です";
}

function saveTestResult(time, score) {
  const list = JSON.parse(localStorage.getItem("typingTestResults") || "[]");
  list.push({
    date: new Date().toISOString(),
    level: currentLevel,
    timeLimit: time,
    score
  });
  localStorage.setItem("typingTestResults", JSON.stringify(list));
}

/* ===== 問題処理 ===== */
async function loadProblems(level) {
  const file = level === "syokyu" ? "syokyu.txt" :
               level === "tyukyu" ? "tyukyu.txt" : "jyokyu.txt";

  const res = await fetch(file);
  const text = await res.text();
  problems = text.trim().split("\n").map(l => {
    const [h, r] = l.split(",");
    return { hira: h, roma: r };
  });

  currentIndex = 0;
  setUI(isTestMode ? "before" : "during");
  showProblem();
}

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

document.addEventListener("keydown", e => {
  if (isTestMode && !isGameStarted) return;
  const k = e.key.toLowerCase();
  if (!currentRoma || k === " ") return;

  if (currentRoma.startsWith(k)) {
    currentRoma = currentRoma.slice(1);
    const i = displayRoma.indexOf(k);
    if (i !== -1) displayRoma = displayRoma.slice(0, i) + displayRoma.slice(i + 1);
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
