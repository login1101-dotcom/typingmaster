let problems = [];
let currentIndex = 0;
let currentHira = "";
let currentRoma = "";
let displayRoma = "";

let isGameStarted = false;
let correctCount = 0;
let attemptedCount = 0;
let hasStartedTyping = false;
let timeLimit = 60;

/* =========================
   上部UI生成
========================= */
function renderTopBar(state) {
  const left = document.getElementById("uiLeft");
  const center = document.getElementById("uiCenter");
  const right = document.getElementById("uiRight");

  left.innerHTML = `<a href="index.html" class="btn-home">戻る</a>`;
  right.innerHTML = `<a href="results.html" class="btn-home">結果</a>`;

  if (state === "idle" || state === "playing") {
    center.innerHTML = `
      時間選択
      <select id="timeSelect">
        <option value="60">01:00</option>
        <option value="120">02:00</option>
        <option value="180">03:00</option>
        <option value="300">05:00</option>
        <option value="600">10:00</option>
      </select>
      <a href="#" id="startBtn" class="btn-start">スタート</a>
    `;

    document.getElementById("startBtn").onclick = e => {
      e.preventDefault();
      timeLimit = Number(document.getElementById("timeSelect").value);
      startTest();
    };
  }

  if (state === "finished") {
    center.innerHTML = "";
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
    renderRetryButtons();
  }
}

/* =========================
   再テストUI
========================= */
function renderRetryButtons() {
  const box = document.getElementById("retryButtons");
  box.innerHTML = "";

  const same = document.createElement("a");
  same.href = "#";
  same.className = "btn-home";
  same.textContent = "この条件で再テスト";
  same.onclick = e => {
    e.preventDefault();
    restartTest();
  };

  const change = document.createElement("a");
  change.href = "index.html";
  change.className = "btn-home";
  change.textContent = "条件変更して再テスト";

  box.appendChild(same);
  box.appendChild(change);
}

/* =========================
   テスト制御
========================= */
function startTest() {
  currentIndex = 0;
  correctCount = 0;
  attemptedCount = 0;
  isGameStarted = true;

  // ★ キーボード再生成（重要）
  if (window.buildKeyboard) buildKeyboard();
  if (window.buildFutureKeyboard) buildFutureKeyboard();

  setUI("playing");
  showProblem();
}

function restartTest() {
  startTest();
}

function endTest() {
  isGameStarted = false;
  setUI("finished");
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

window.addEventListener("DOMContentLoaded", init);
