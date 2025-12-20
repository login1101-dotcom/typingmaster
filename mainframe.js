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
      <select id="timeSelect"></select>
      <button id="startBtn" class="btn-start">スタート</button>
    `;

    const select = document.getElementById("timeSelect");

    /* 1–10秒（1秒刻み） */
    for (let s = 1; s <= 10; s++) {
      select.appendChild(
        new Option(`00:${String(s).padStart(2, "0")}`, s)
      );
    }

    /* 20–60秒（10秒刻み） */
    for (let s = 20; s <= 60; s += 10) {
      select.appendChild(
        new Option(
          s === 60 ? "01:00" : `00:${s}`,
          s
        )
      );
    }

    /* 2–10分（1分刻み） */
    for (let m = 2; m <= 10; m++) {
      select.appendChild(
        new Option(`${String(m).padStart(2, "0")}:00`, m * 60)
      );
    }

    /* 15–30分（5分刻み） */
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

    document.getElementById("startBtn").onclick = () => {
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
