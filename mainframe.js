let problems = [];
let currentIndex = 0;
let currentHira = "";
let currentRoma = "";   // 判定用（スペース除去）
let displayRoma = "";   // 表示用（スペース保持）

// テストモード用の変数
let isTestMode = false;
let currentLevel = "syokyu";
let timeLimit = 60;
let remainingTime = 0;
let timerInterval = null;
let isGameStarted = false;
let correctCount = 0;
let totalQuestions = 0;

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

  // シャッフル
  for (let i = problems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [problems[i], problems[j]] = [problems[j], problems[i]];
  }

  totalQuestions = problems.length;
  currentIndex = 0;

  if (isTestMode) {
    setupTestMode();
  } else {
    showProblem();
  }
}

function setupTestMode() {
  showBeforeStart();

  const timeSelect = document.getElementById("timeSelect");
  timeSelect.innerHTML = "";

  // 10〜50秒
  for (let sec = 10; sec <= 50; sec += 10) {
    const opt = document.createElement("option");
    opt.value = sec;
    opt.textContent = `00:${sec.toString().padStart(2, "0")}`;
    timeSelect.appendChild(opt);
  }

  // 1〜30分
  for (let min = 1; min <= 30; min++) {
    for (let sec = 0; sec < 60; sec += 10) {
      const totalSec = min * 60 + sec;
      const opt = document.createElement("option");
      opt.value = totalSec;
      opt.textContent = `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
      if (totalSec === 60) opt.selected = true;
      timeSelect.appendChild(opt);
      if (min === 30 && sec === 0) break;
    }
  }

  document.getElementById("startBtn").onclick = startTest;
}

function startTest() {
  timeLimit = parseInt(document.getElementById("timeSelect").value);
  remainingTime = timeLimit;
  isGameStarted = true;
  correctCount = 0;
  currentIndex = 0;

  showDuringTest();

  const resultsBtn = document.getElementById("resultsBtn");
  resultsBtn.href = `results.html?level=${currentLevel}&time=${timeLimit}`;

  updateTimerDisplay();
  updateScoreDisplay();

  timerInterval = setInterval(() => {
    remainingTime--;
    updateTimerDisplay();
    if (remainingTime <= 0) endTest();
  }, 1000);

  showProblem();
}

function updateTimerDisplay() {
  const min = Math.floor(remainingTime / 60);
  const sec = remainingTime % 60;
  document.getElementById("timerDisplay").textContent =
    `残り時間: ${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function updateScoreDisplay() {
  document.getElementById("scoreDisplay").textContent =
    `得点: ${correctCount * 10}`;
}

function endTest() {
  clearInterval(timerInterval);
  isGameStarted = false;

  saveTestResult(timeLimit, correctCount * 10);

  document.getElementById("questionHira").textContent = "お疲れ様でした";
  document.getElementById("questionRoma").textContent = "テスト終了です";
}

function saveTestResult(timeLimitSec, score) {
  let results = JSON.parse(localStorage.getItem("typingTestResults") || "[]");

  results.push({
    date: new Date().toISOString(),
    level: currentLevel,
    timeLimit: timeLimitSec,
    score: score
  });

  localStorage.setItem("typingTestResults", JSON.stringify(results));
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
      if (isTestMode) {
        correctCount++;
        updateScoreDisplay();
      }
      currentIndex = (currentIndex + 1) % problems.length;
      showProblem();
    }
  }
});

/* ===== UI表示制御（ここが今回の核心） ===== */

function showBeforeStart() {
  document.getElementById("testControls").style.display = "block";
  document.getElementById("statsDisplay").style.display = "none";
}

function showDuringTest() {
  document.getElementById("testControls").style.display = "none";
  document.getElementById("statsDisplay").style.display = "block";
}

/* ===== 初期化 ===== */

const params = new URLSearchParams(window.location.search);
isTestMode = params.get("mode") === "test";
currentLevel = params.get("level") || "syokyu";

loadProblems(currentLevel);
