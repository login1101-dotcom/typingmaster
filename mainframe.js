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

/* デフォルト 60秒 */
let timeLimit = 60;
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
        <div style="font-size: 18px; font-weight: 900; color: #1e293b;">時間選択</div>
        <select id="timeSelect" style="height: 36px; padding: 0 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 18px;"></select>
        <div class="flash-border" style="display: inline-flex; align-items: center; height: 36px; font-weight: 900; font-size: 18px; color: #1e293b; background: #ffffff; padding: 0 20px; border-radius: 8px; border: 1px solid #e2e8f0;">スペースキーを押すとテストが開始されます</div>
      </div>
    `;

    const select = document.getElementById("timeSelect");

    // 1-9秒を削除
    select.appendChild(new Option("00:10", 10));

    // 20, 40, 50を削除し、30と60(1分)のみ追加
    select.appendChild(new Option("00:30", 30));
    select.appendChild(new Option("01:00", 60));
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




  // 設定パネル初期化
  initSettingsPanel();
}

/* =========================
   設定パネル制御
========================= */
function initSettingsPanel() {
  const settings = JSON.parse(localStorage.getItem("keyboardSettings") || "{}");

  // Elements
  const chkTopPress = document.getElementById("chk-top-press");
  const chkTopGuide = document.getElementById("chk-top-guide");
  const chkTopHeat = document.getElementById("chk-top-heat");

  const chkBtmShow = document.getElementById("chk-btm-show");
  const chkBtmGuide = document.getElementById("chk-btm-guide");
  const chkBtmHeat = document.getElementById("chk-btm-heat");

  // Defaults
  if (settings.topPress === undefined) settings.topPress = true;
  if (settings.topGuide === undefined) settings.topGuide = true;
  if (settings.topHeat === undefined) settings.topHeat = false;

  if (settings.btmShow === undefined) settings.btmShow = true;
  if (settings.btmGuide === undefined) settings.btmGuide = true;
  if (settings.btmHeat === undefined) settings.btmHeat = false;

  // Apply to Checkboxes
  if (chkTopPress) chkTopPress.checked = settings.topPress;
  if (chkTopGuide) chkTopGuide.checked = settings.topGuide;
  if (chkTopHeat) chkTopHeat.checked = settings.topHeat;

  if (chkBtmShow) chkBtmShow.checked = settings.btmShow;
  if (chkBtmGuide) chkBtmGuide.checked = settings.btmGuide;
  if (chkBtmHeat) chkBtmHeat.checked = settings.btmHeat;

  // Apply Logic Function
  function applySettings() {
    // Save
    const currentSettings = {
      topPress: chkTopPress ? chkTopPress.checked : true,
      topGuide: chkTopGuide ? chkTopGuide.checked : true,
      topHeat: chkTopHeat ? chkTopHeat.checked : false,
      btmShow: chkBtmShow ? chkBtmShow.checked : true,
      btmGuide: chkBtmGuide ? chkBtmGuide.checked : true,
      btmHeat: chkBtmHeat ? chkBtmHeat.checked : false
    };
    localStorage.setItem("keyboardSettings", JSON.stringify(currentSettings));

    const kbBox = document.getElementById("keyboardBox");
    const futureBox = document.getElementById("futureKeyboardBox");
    const stats = JSON.parse(localStorage.getItem("neotyping_stats") || "{}");

    // Top Keyboard Controls
    if (kbBox) {
      // Guide
      if (currentSettings.topGuide) kbBox.classList.remove("no-guide");
      else kbBox.classList.add("no-guide");

      // Press Feedback
      if (currentSettings.topPress) kbBox.classList.remove("no-press");
      else kbBox.classList.add("no-press");

      // Heatmap
      if (currentSettings.topHeat) {
        if (window.applyHeatmap) window.applyHeatmap(stats); // Apply colors
      } else {
        // Reset colors to white (but keep red lines logic intact via CSS)
        // We can reuse applyHeatmap with empty stats or manually clear classes
        // Simple way: applyHeatmap with empty object effectively clears it if implemented right, 
        // or we just remove heatmap classes. 
        // Let's assume applyHeatmap clears if stats are empty? No, usually it doesn't clear previous.
        // We'll manually remove heatmap classes.
        const keys = kbBox.querySelectorAll(".key");
        keys.forEach(k => {
          k.className = k.className.replace(/heatmap-level-\d/g, "").trim();
          k.style.background = ""; // Clear inline styles if any
          k.style.color = "";
          // Restore simple styling
          if (k.classList.contains("active")) {
            // Let CSS handle active color
          }
        });
        // Remove miss overlays
        const overlays = kbBox.querySelectorAll(".miss-overlay");
        overlays.forEach(o => o.remove());
      }
    }

    // Bottom Keyboard Controls
    if (futureBox) {
      // Show/Hide
      const parent = futureBox.parentElement; // .center-card
      if (parent && parent.classList.contains("keyboard-card")) {
        parent.style.display = currentSettings.btmShow ? "flex" : "none";
      }

      // Guide
      if (currentSettings.btmGuide) futureBox.classList.remove("no-guide");
      else futureBox.classList.add("no-guide");

      // Heatmap (Future)
      // Since we don't have a dedicated function for future heatmap yet, 
      // we'll leave this as a placeholder or implement it if requested.
      // For now, we just ensure no error.
      if (currentSettings.btmHeat) {
        // TODO: Implement Future Keyboard Heatmap
      } else {
        // Clear future heatmap if any
      }
    }
  }

  // Event Listeners
  const allChks = [chkTopPress, chkTopGuide, chkTopHeat, chkBtmShow, chkBtmGuide, chkBtmHeat];
  allChks.forEach(chk => {
    if (chk) chk.addEventListener("change", applySettings);
  });

  // Initial Apply
  applySettings();
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

