let problems = [];
let currentIndex = 0;
let currentHira = "";
let currentRoma = "";
let displayRoma = "";

let isGameStarted = false;
let correctCount = 0;
let attemptedCount = 0;
let hasStartedTyping = false;

/* デフォルト 1秒 */
let timeLimit = 1;
let remainingTime = 0;
let timerInterval = null;

/* =========================
   上部UI生成
========================= */
function renderTopBar(state) {
  const left = document.getElementById("uiLeft");
  const center = document.getElementById("uiCenter");
  const right = document.getElementById("uiRight");

  left.innerHTML = `<a href="index.html" class="btn-home">戻る</a>`;
  right.innerHTML = `<a href="results.html" class="btn-home">結果</a>`;

  /* 開始前・プレイ中 */
  if (state === "idle") {
    center.innerHTML = `
      時間選択
      <select id="timeSelect"></select>
      <button id="startBtn" class="btn-start">スタート</button>
    `;

    const select = document.getElementById("timeSelect");

    for (let s = 1; s <= 10; s++) {
      select.appendChild(new Option(`00:${String(s).padStart(2, "0")}`, s));
    }
    for (let s = 20; s <= 60; s += 10) {
      select.appendChild(
        new Option(s === 60 ? "01:00" : `00:${s}`, s)
      );
    }
    for (let m = 2; m <= 10; m++) {
      select.appendChild(
        new Option(`${String(m).padStart(2, "0")}:00`, m * 60)
      );
    }
    for (let m = 15; m <= 30; m += 5) {
      select.appendChild(
        new Option(`${String(m).padStart(2, "0")}:00`, m * 60)
      );
    }

    select.value = String(timeLimit);
    timeLimit = Number(select.value);
    select.onchange = () => {
      timeLimit = Number(select.value);
    };

    document.getElementById("startBtn").onclick = startTest;
  }

  /* テスト中 */
  if (state === "playing") {
    center.textContent = `残り時間 ${formatTime(remainingTime)}`;
  }

  /* 終了後 */
  if (state === "finished") {
    const score = correctCount * 10;
    const accuracy = attemptedCount
      ? Math.floor((correctCount / attemptedCount) * 100)
      : 0;

    center.textContent =
      `得点：${score}  正解数：${correctCount}  正解率：${accuracy}%`;
  }
}

/* =========================
   UI切替
========================= */
function setUI(state) {
  const play = document.getElementById("questionCardPlaying");
  const finish = document.getElementById("questionCardFinished");

  renderTopBar(state);

  if (state === "playing") {
    play.style.display = "flex";
    finish.style.display = "none";
  }

  if (state === "finished") {
    play.style.display = "none";
    finish.style.display = "flex";
  }
}

/* =========================
   テスト制御
========================= */
function startTest() {
  currentIndex = 0;
  correctCount = 0;
  attemptedCount = 0;
  isGameStarted = true;

  remainingTime = timeLimit;

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    remainingTime--;
    renderTopBar("playing");
    if (remainingTime <= 0) {
      endTest();
    }
  }, 1000);

  if (window.buildKeyboard) buildKeyboard();
  if (window.buildFutureKeyboard) buildFutureKeyboard();

  setUI("playing");
  showProblem();
}

function endTest() {
  clearInterval(timerInterval);
  isGameStarted = false;
  setUI("finished");

  /* 再テスト（同条件） */
  const retrySame = document.getElementById("retrySame");
  if (retrySame) {
    retrySame.onclick = e => {
      e.preventDefault();
      setUI("idle");
    };
  }
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
  if (!isGameStarted) return;

  const key = e.key.toLowerCase();
  if (!currentRoma) return;

  if (!hasStartedTyping) {
    attemptedCount++;
    hasStartedTyping = true;
  }

  if (currentRoma.startsWith(key)) {
    currentRoma = currentRoma.slice(1);
    displayRoma = displayRoma.slice(1);
    document.getElementById("questionRoma").textContent = displayRoma;

    if (currentRoma.length === 0) {
      correctCount++;
      currentIndex++;

      if (currentIndex >= problems.length) {
        endTest();
      } else {
        showProblem();
      }
    }
  }
});

/* =========================
   初期化
========================= */
async function init() {
  const res = await fetch("syokyu.txt");
  const text = await res.text();

  problems = text.trim().split("\n").map(l => {
    const [h, r] = l.split(",");
    return { hira: h, roma: r };
  });

  setUI("idle");
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

window.addEventListener("DOMContentLoaded", init);
