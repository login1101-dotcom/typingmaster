let problems = [];
let currentIndex = 0;
let currentHira = "";
let currentRoma = "";
let displayRoma = "";

let isGameStarted = false;
let correctCount = 0;
let attemptedCount = 0;
let totalKeyStrokes = 0;
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
  right.innerHTML = `<a href="results.html" class="btn-home">テスト結果データをみる</a>`;

  if (state === "idle") {
    center.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px;">
        <div style="font-size: 1rem; font-weight: 900; color: #1e293b;">時間選択</div>
        <select id="timeSelect" style="padding: 4px 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 1rem;"></select>
        <div class="flash-border" style="font-weight: 900; font-size: 1rem; color: #1e293b; background: #ffffff; padding: 4px 12px; border-radius: 8px; border: 1px solid #e2e8f0;">スペースキーを押すとテストが開始されます</div>
      </div>
    `;

    const select = document.getElementById("timeSelect");

    for (let s = 1; s <= 10; s++) {
      select.appendChild(new Option(`00:${String(s).padStart(2, "0")}`, s));
    }
    for (let s = 20; s <= 60; s += 10) {
      select.appendChild(new Option(s === 60 ? "01:00" : `00:${s}`, s));
    }
    for (let m = 2; m <= 10; m++) {
      select.appendChild(new Option(`${String(m).padStart(2, "0")}:00`, m * 60));
    }
    for (let m = 15; m <= 30; m += 5) {
      select.appendChild(new Option(`${String(m).padStart(2, "0")}:00`, m * 60));
    }

    select.value = String(timeLimit);
    timeLimit = Number(select.value);
    select.onchange = () => {
      timeLimit = Number(select.value);
      select.blur(); // 選択後にフォーカスを外してスペースキーの誤発動を防ぐ
    };
  }

  if (state === "playing") {
    center.textContent = `残り時間 ${formatTime(remainingTime)}`;
  }

  if (state === "finished") {
    const score = correctCount * 10;
    const accuracy = totalKeyStrokes
      ? Math.floor((correctCount / totalKeyStrokes) * 100)
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

  if (state === "idle") {
    if (play) play.style.display = "flex";
    if (finish) finish.style.display = "none";
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

function restartSameCondition() {
  clearInterval(timerInterval);

  currentIndex = 0;
  correctCount = 0;
  attemptedCount = 0;
  isGameStarted = true;

  remainingTime = timeLimit;

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

  if (window.clearFutureHighlight) {
    clearFutureHighlight();
  }

  // --- スコアを保存する処理を追加 ---
  saveResult();

  // --- お遊び機能：特別メッセージ判定 ---
  checkSpecialPraise();

  setUI("finished");
}

function checkSpecialPraise() {
  const msgEl = document.getElementById("finishMsg");
  if (!msgEl) return;

  // デフォルトに戻す
  msgEl.textContent = "おつかれさまでした";
  msgEl.style.fontSize = "28px";
  msgEl.style.color = "#000";

  // 30秒以上のテスト限定
  if (timeLimit < 30) return;

  const scoreChars = correctCount;
  const threshold = 40;

  if (scoreChars >= threshold) {
    let streak = Number(localStorage.getItem('typingStreak') || 0);
    streak++;
    localStorage.setItem('typingStreak', streak);

    if (streak === 1) {
      msgEl.textContent = "むむっ！？おぬしやるな！ マグレでないなら星をやろう";
      msgEl.style.fontSize = "20px"; // 長いので少し小さく
      msgEl.style.color = "#e65100";
    } else if (streak >= 2) {
      msgEl.innerHTML = "お見事！マグレではないようだな。<br><span style='font-size:16px;'>証として星（称号）を授けよう！</span>";
      msgEl.style.fontSize = "20px";
      msgEl.style.color = "#d32f2f";
      saveTitle("おぬしやるな級");
    }
  } else {
    localStorage.setItem('typingStreak', 0);
  }
}

function saveTitle(titleName) {
  const titles = JSON.parse(localStorage.getItem('typingTitles') || '[]');
  if (!titles.includes(titleName)) {
    titles.push(titleName);
    localStorage.setItem('typingTitles', JSON.stringify(titles));
  }
}

function saveResult() {
  // URLからレベルを取得（保存用）
  const params = new URLSearchParams(location.search);
  const level = params.get("level") || "syokyu";

  const newResult = {
    date: new Date().toISOString(),
    score: correctCount * 10,
    correctCount: correctCount,
    attemptedCount: attemptedCount,
    level: level,
    timeLimit: timeLimit,
    totalKeyStrokes: totalKeyStrokes
  };

  // 既存のデータを読み込み
  const rawData = localStorage.getItem('typingTestResults');
  const results = rawData ? JSON.parse(rawData) : [];

  // 新しい結果を追加して保存
  results.push(newResult);
  localStorage.setItem('typingTestResults', JSON.stringify(results));
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

  if (window.highlightFutureNextKey && currentRoma) {
    highlightFutureNextKey(currentRoma[0]);
  }
}

/* =========================
   入力処理（修正①＋未来キーボード復活）
========================= */
document.addEventListener("keydown", e => {
  // アイドル中にスペースキーで開始
  if (!isGameStarted && e.code === "Space") {
    // セレクトボックスなどにフォーカスがある場合でも強制的に開始する
    // ただし、もしセレクトボックスが開いている最中などの挙動を抑制するため、
    // ここで preventDefault を確実に行う。

    e.preventDefault();
    startTest();
    return;
  }

  if (!isGameStarted) return;
  const key = e.key.toLowerCase();
  if (!currentRoma) return;

  // 総打鍵数をカウント
  totalKeyStrokes++;

  if (!hasStartedTyping) {
    attemptedCount++;
    hasStartedTyping = true;
  }

  if (key === currentRoma[0]) {
    currentRoma = currentRoma.slice(1);
    displayRoma = displayRoma.replace(/^\s*/, "").slice(1);
    document.getElementById("questionRoma").textContent = displayRoma;

    if (window.highlightFutureNextKey) {
      highlightFutureNextKey(currentRoma[0]);
    }

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

  // ▼ URLの ?level= を取得（なければ初級）
  const params = new URLSearchParams(location.search);
  const level = params.get("level") || "syokyu";

  // ▼ レベルに応じた問題ファイルを読み込む
  const res = await fetch(`${level}.txt`);
  const text = await res.text();

  problems = text.trim().split("\n").map(l => {
    const [h, r] = l.split(",");
    return { hira: h, roma: r };
  });

  setUI("idle");

  // 初期メッセージのセット（ガイド失敗時でも表示されるように先に実行）
  const hiraEl = document.getElementById("questionHira");
  if (hiraEl) hiraEl.textContent = "ここに問題が表示されます";
  const romaEl = document.getElementById("questionRoma");
  if (romaEl) romaEl.textContent = "";

  try {
    if (typeof applyLevelGuide === "function") {
      applyLevelGuide(level);
    }
  } catch (e) {
    console.error("Guide fail:", e);
  }

  const retrySame = document.getElementById("retrySame");
  if (retrySame) {
    retrySame.addEventListener("click", e => {
      e.preventDefault();
      restartSameCondition();
    });
  }
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* =========================
   起動
========================= */
window.addEventListener("DOMContentLoaded", init);
