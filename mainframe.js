let problems = [];
let currentIndex = 0;
let currentHira = "";
let currentRoma = "";   // 判定用（スペース除去）
let displayRoma = "";   // 表示用（スペース保持）

// テストモード用の変数
let isTestMode = false;
let currentLevel = "syokyu"; // 現在のレベル（初級・中級・上級）
let timeLimit = 60; // デフォルト1分（秒単位）
let remainingTime = 0;
let timerInterval = null;
let isGameStarted = false;
let correctCount = 0;
let totalQuestions = 0;

async function loadProblems(level) {
  const file = level === "syokyu" ? "syokyu.txt" :
    level === "tyukyu" ? "tyukyu.txt" :
      "jyokyu.txt";

  const res = await fetch(file);
  const text = await res.text();
  problems = text.trim().split("\n").map(line => {
    const [h, r] = line.split(",");
    return { hira: h, roma: r };
  });

  // 問題をシャッフルする
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
  // テストモードのUI表示
  document.getElementById("testControls").style.display = "block";

  // 時間選択肢を生成（10秒から30分まで、10秒単位）
  const timeSelect = document.getElementById("timeSelect");
  timeSelect.innerHTML = "";

  // 10秒〜50秒（10秒単位）
  for (let sec = 10; sec <= 50; sec += 10) {
    const option = document.createElement("option");
    option.value = sec;
    option.textContent = `00:${sec.toString().padStart(2, '0')}`;
    timeSelect.appendChild(option);
  }

  // 1分〜30分（10秒単位）
  for (let min = 1; min <= 30; min++) {
    for (let sec = 0; sec < 60; sec += 10) {
      const totalSec = min * 60 + sec;
      const option = document.createElement("option");
      option.value = totalSec;
      option.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
      if (totalSec === 60) {
        option.selected = true; // デフォルト1分
      }
      timeSelect.appendChild(option);

      if (min === 30 && sec === 0) break; // 30:00で終了
    }
  }

  // スタートボタンのイベント
  document.getElementById("startBtn").addEventListener("click", startTest);
}

function startTest() {
  timeLimit = parseInt(document.getElementById("timeSelect").value);
  remainingTime = timeLimit;
  isGameStarted = true;
  correctCount = 0;
  currentIndex = 0;

  // UIの切り替え
  document.getElementById("testControls").style.display = "none";
  document.getElementById("statsDisplay").style.display = "block";

  // テスト結果ボタンのURLにパラメータを設定
  const resultsBtn = document.getElementById("resultsBtn");
  resultsBtn.href = `results.html?level=${currentLevel}&time=${timeLimit}`;

  // タイマー開始
  updateTimerDisplay();
  updateScoreDisplay();
  timerInterval = setInterval(() => {
    remainingTime--;
    updateTimerDisplay();

    if (remainingTime <= 0) {
      endTest();
    }
  }, 1000);

  showProblem();
}

function updateTimerDisplay() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  document.getElementById("timerDisplay").textContent =
    `残り時間: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateScoreDisplay() {
  const currentScore = correctCount * 10;
  document.getElementById("scoreDisplay").textContent = `得点: ${currentScore}`;
}

function endTest() {
  clearInterval(timerInterval);
  isGameStarted = false;

  // テスト結果を保存
  saveTestResult(timeLimit, correctCount * 10);

  // 問題表示エリアに終了メッセージを表示
  document.getElementById("questionHira").textContent = "お疲れ様でした";
  document.getElementById("questionRoma").textContent = "テスト終了です";

  // 時間切れ後も画面に結果を表示し続ける（ポップアップなし、ホームに戻らない）
}

function saveTestResult(timeLimitSec, score) {
  // 既存の記録を取得
  let results = JSON.parse(localStorage.getItem('typingTestResults') || '[]');

  // 新しい記録を追加
  const newResult = {
    date: new Date().toISOString(),
    level: currentLevel, // レベル（syokyu, tyukyu, jyokyu）
    timeLimit: timeLimitSec, // 秒単位
    score: score
  };

  results.push(newResult);

  // 保存
  localStorage.setItem('typingTestResults', JSON.stringify(results));
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

document.addEventListener("keydown", function (e) {
  // テストモードでゲーム開始前は入力を受け付けない
  if (isTestMode && !isGameStarted) return;

  const key = e.key.toLowerCase();
  if (!currentRoma) return;

  // スペースキーは無視
  if (key === " ") {
    e.preventDefault();
    return;
  }

  // 判定
  if (currentRoma.startsWith(key)) {

    // 判定用を1文字削除
    currentRoma = currentRoma.substring(1);

    // 表示用もkeyに一致する最初の位置の1文字だけ削除
    const i = displayRoma.indexOf(key);
    if (i !== -1) {
      displayRoma = displayRoma.slice(0, i) + displayRoma.slice(i + 1);
    }

    document.getElementById("questionRoma").textContent = displayRoma;

    if (currentRoma.length === 0) {
      // 正解した
      if (isTestMode) {
        correctCount++;
        updateScoreDisplay();
      }

      setTimeout(() => {
        currentIndex = (currentIndex + 1) % problems.length;
        showProblem();
      }, 0);
    }
  }
});

// 初期化
const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");
isTestMode = (mode === "test");
currentLevel = params.get("level") || "syokyu";

loadProblems(currentLevel);
