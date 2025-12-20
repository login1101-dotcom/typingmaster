let problems = [];
let currentIndex = 0;
let currentHira = "";
let currentRoma = "";
let displayRoma = "";

let isGameStarted = false;
let correctCount = 0;
let attemptedCount = 0;
let hasStartedTyping = false;

/* =========================
   UI切り替え（innerHTML禁止）
========================= */
function setUI(state) {
  const play = document.getElementById("questionCardPlaying");
  const finish = document.getElementById("questionCardFinished");

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
   終了
========================= */
function endTest() {
  isGameStarted = false;
  setUI("finished");
}

/* =========================
   再テスト
========================= */
document.getElementById("retrySame")?.addEventListener("click", e => {
  e.preventDefault();
  currentIndex = 0;
  correctCount = 0;
  attemptedCount = 0;
  isGameStarted = true;
  setUI("playing");
  showProblem();
});

/* =========================
   初期化
========================= */
async function loadProblems() {
  const res = await fetch("syokyu.txt");
  const text = await res.text();

  problems = text.trim().split("\n").map(line => {
    const [h, r] = line.split(",");
    return { hira: h, roma: r };
  });

  isGameStarted = true;
  setUI("playing");
  showProblem();
}

window.addEventListener("DOMContentLoaded", loadProblems);
