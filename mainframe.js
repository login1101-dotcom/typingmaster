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

  // Update Heatmap
  const stats = JSON.parse(localStorage.getItem("neotyping_stats") || "{}");
  if (window.applyHeatmap) {
    applyHeatmap(stats);
  }
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
    recordKeyResult(currentRoma[0], false); // Success for this key
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
  } else {
    // Miss
    recordKeyResult(currentRoma[0], true); // Miss for this target key
  }
});

/* =========================
   データ分析・保存 (Local Storage)
========================= */
function recordKeyResult(char, isMiss) {
  const k = char.toUpperCase();
  const stats = JSON.parse(localStorage.getItem("neotyping_stats") || "{}");

  if (!stats[k]) stats[k] = { total: 0, miss: 0 };

  stats[k].total++;
  if (isMiss) stats[k].miss++;

  localStorage.setItem("neotyping_stats", JSON.stringify(stats));
}

/* =========================
   初期化
========================= */
/* =========================
   苦手特訓モード
========================= */
async function startWeaknessTest() {
  const stats = JSON.parse(localStorage.getItem("neotyping_stats") || "{}");

  // 1. Identify weak keys (Top 5 by Miss Rate, min accuracy < 90%, min attempts > 5)
  // or simple weighted score: miss * rate
  let keys = Object.keys(stats).filter(k => stats[k].total >= 5);

  if (keys.length === 0) {
    alert("まだ十分なデータがありません。通常モードで練習してください。");
    return;
  }

  // Sort by miss rate desc
  keys.sort((a, b) => {
    const rateA = stats[a].miss / stats[a].total;
    const rateB = stats[b].miss / stats[b].total;
    return rateB - rateA;
  });

  const weakKeys = keys.slice(0, 5); // Take top 5 weak keys
  console.log("Weak Keys:", weakKeys);

  if (weakKeys.length === 0 || stats[weakKeys[0]].miss === 0) {
    alert("苦手なキーが見つかりません（正解率が高いです）。");
    return;
  }

  document.getElementById("questionHira").textContent = "データを分析中...";

  // 2. Fetch All Level Files
  const files = ["syokyu.txt", "syokyu2.txt", "cyukyu1.txt", "chukyu2.txt", "tyukyu.txt", "jyokyu.txt", "jyokyu1.txt"];
  let allProblems = [];

  for (const f of files) {
    try {
      const res = await fetch(f);
      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split("\n");
        lines.forEach(line => {
          const [h, r] = line.split(",");
          if (h && r) allProblems.push({ hira: h, roma: r });
        });
      }
    } catch (e) { console.error(e); }
  }

  // 3. Filter problems containing weak keys // TODO: Optimize? infinite loop?
  // We want problems where the ROMA string contains any of the weak keys.
  const targetProblems = allProblems.filter(p => {
    const romaUpper = p.roma.toUpperCase();
    return weakKeys.some(wk => romaUpper.includes(wk));
  });

  if (targetProblems.length === 0) {
    alert("該当する問題が見つかりませんでした。");
    return;
  }

  // Shuffle
  problems = targetProblems.sort(() => Math.random() - 0.5);

  // Start
  currentIndex = 0;
  correctCount = 0;
  attemptedCount = 0;
  isGameStarted = true;

  // Reset Timer to standard 60s for training or keep current setting?
  // Let's use the currently selected timeLimit
  remainingTime = timeLimit;

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    remainingTime--;
    renderTopBar("playing");
    if (remainingTime <= 0) {
      endTest();
    }
  }, 1000);

  if (window.buildKeyboard) buildKeyboard(); // if function name changed? No, it's createKeyboard in keyboard.js but init calls it? 
  // Wait, keyboard.js has createKeyboard, but mainframe.js calls buildKeyboard? 
  // Let's check init() again. init doesn't call buildKeyboard. startTest does.
  // Wait, line 119 in mainframe.js calls `window.buildKeyboard`.
  // CHECK: keyboard.js defines `createKeyboard`. It does NOT define `buildKeyboard`.
  // This might be a bug in the original code or I missed something. 
  // Ah, keyboard.js executes `createKeyboard()` at the very end.
  // So the keyboard is created on load.
  // `startTest` lines 119-120: `if (window.buildKeyboard) buildKeyboard();`
  // This suggests there might be another file or previous version. 
  // Since `keyboard.js` just exposes `createKeyboard`, and it runs on load.
  // We can ignore the buildKeyboard call if it doesn't exist.

  setUI("playing");
  showProblem();

  // Inform user
  alert(`【苦手特訓開始】\n苦手キー: ${weakKeys.join(", ")}\n関連問題数: ${problems.length}問`);
}

/* =========================
   初期化
========================= */
async function init() {

  // ▼ URLの ?level= を取得（なければ初級）
  const params = new URLSearchParams(location.search);
  const level = params.get("level") || "syokyu";

  // ▼ レベルに応じた問題ファイルを読み込む
  // ▼ レベルに応じた問題ファイルを読み込む
  let problemText = "";
  try {
    const res = await fetch(`${level}.txt`);
    if (!res.ok) throw new Error("Fetch failed");
    problemText = await res.text();
  } catch (e) {
    console.warn("ローカル環境またはファイルが見つからないため、ダミー問題を使用します。");
    // ダミーデータ（localテスト用）
    problemText = `
あ,a
い,i
う,u
え,e
お,o
    `.trim();
  }

  problems = problemText.trim().split("\n").map(l => {
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

  // Weakness Button Listener
  const weakBtn = document.getElementById("startWeakness");
  if (weakBtn) {
    weakBtn.addEventListener("click", e => {
      e.preventDefault();
      startWeaknessTest();
    });
  }

  // Initial Heatmap
  const stats = JSON.parse(localStorage.getItem("neotyping_stats") || "{}");
  if (window.applyHeatmap) {
    applyHeatmap(stats);
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

