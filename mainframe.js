let problems = [];
let currentIndex = 0;
let currentHira = "";
let currentRoma = "";
let displayRoma = "";

let isGameStarted = false;
let correctCount = 0; // 正解したキーの数
let attemptedCount = 0;
let totalKeyStrokes = 0; // 総打鍵数（ミス含む）
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
    // 新計算式での表示
    const speed = (correctCount / timeLimit).toFixed(1);
    const accuracy = totalKeyStrokes > 0 ? ((correctCount / totalKeyStrokes) * 100).toFixed(1) : 0;
    const score = Math.round(Number(accuracy) * Number(speed));

    // ランク判定（簡易）
    let rank = "C";
    if (score >= 400) rank = "S";
    else if (score >= 300) rank = "A";
    else if (score >= 200) rank = "B";

    center.innerHTML =
      `ランク:<span style="font-weight:bold; font-size:1.2em; color:#d97706;">${rank}</span> (評価値:${score})  ` +
      `Speed:${speed}key/s  正解率:${accuracy}%`;
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
  totalKeyStrokes = 0;
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

  if (window.createKeyboard) createKeyboard();
  if (window.createFutureKeyboard) createFutureKeyboard();

  setUI("playing");
  showProblem();
}

function restartSameCondition() {
  clearInterval(timerInterval);

  currentIndex = 0;
  correctCount = 0;
  attemptedCount = 0;
  totalKeyStrokes = 0;
  isGameStarted = true;

  remainingTime = timeLimit;

  timerInterval = setInterval(() => {
    remainingTime--;
    renderTopBar("playing");
    if (remainingTime <= 0) {
      endTest();
    }
  }, 1000);

  if (window.createKeyboard) createKeyboard();
  if (window.createFutureKeyboard) createFutureKeyboard();

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
  const resultData = saveResult();

  // --- お遊び機能：特別メッセージ判定 & 称号付与 ---
  checkSpecialPraise(resultData);

  setUI("finished");

  // Update Heatmap only if enabled in settings
  const settings = JSON.parse(localStorage.getItem("keyboardSettings") || "{}");
  const stats = JSON.parse(localStorage.getItem("neotyping_stats") || "{}");

  if (settings.topHeat && window.applyHeatmap) {
    applyHeatmap(stats);
  }
  if (settings.btmHeat && window.applyFutureHeatmap) {
    applyFutureHeatmap(stats);
  }
}

function checkSpecialPraise(result) {
  const msgEl = document.getElementById("finishMsg");
  if (!msgEl) return;

  // デフォルト
  msgEl.textContent = "おつかれさまでした";
  msgEl.style.fontSize = "28px";
  msgEl.style.color = "#000";

  // 30秒未満は判定しない
  if (result.timeLimit < 30) return;

  // 評価値 (Score) ベースで判定
  const score = result.score;

  if (score >= 300) { // Aランク以上相当
    let streak = Number(localStorage.getItem('typingStreak') || 0);
    streak++;
    localStorage.setItem('typingStreak', streak);

    if (streak === 1) {
      msgEl.textContent = "素晴らしい集中力！この調子だ！";
      msgEl.style.fontSize = "24px";
      msgEl.style.color = "#e65100";
    } else if (streak >= 2) {
      msgEl.innerHTML = "見事だ！安定して高いパフォーマンスを出せているな。<br><span style='font-size:18px;'>その調子で高みを目指せ！</span>";
      msgEl.style.color = "#d32f2f";

      // 特定の条件で称号付与（例：スコア400以上）
      if (score >= 400) {
        saveTitle("タイピングマスター候補生");
      }
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
    alert(`【称号獲得】\n新しい称号「${titleName}」を手に入れました！`);
  }
}

function saveResult() {
  // URLからレベルを取得（保存用）
  const params = new URLSearchParams(location.search);
  const level = params.get("level") || "syokyu";

  // 新計算ロジック
  const speed = correctCount / timeLimit;
  const accuracy = totalKeyStrokes > 0 ? (correctCount / totalKeyStrokes) * 100 : 0;
  const score = Math.round(accuracy * speed); // 評価値

  const newResult = {
    date: new Date().toISOString(),
    score: score,           // 評価値
    speed: speed,           // key/s
    accuracy: accuracy,     // %
    correctCount: correctCount, // 正解キー数
    totalKeyStrokes: totalKeyStrokes, // 総打鍵数
    level: level,
    timeLimit: timeLimit
  };

  // 既存のデータを読み込み
  const rawData = localStorage.getItem('typingTestResults');
  const results = rawData ? JSON.parse(rawData) : [];

  // 新しい結果を追加して保存
  results.push(newResult);
  localStorage.setItem('typingTestResults', JSON.stringify(results));

  return newResult;
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

  if (currentRoma) {
    // 下キーボードのハイライト
    if (window.highlightFutureNextKey) {
      highlightFutureNextKey(currentRoma[0]);
    }
    // 上キーボードのハイライト
    if (window.highlightNextKey) {
      highlightNextKey(currentRoma[0]);
    }
  }
}

/* =========================
   入力処理
========================= */
document.addEventListener("keydown", e => {
  // アイドル中にスペースキーで開始
  if (!isGameStarted && e.code === "Space") {
    e.preventDefault();
    startTest();
    return;
  }

  if (!isGameStarted) return;
  const key = e.key.toLowerCase();

  // 入力があった時点で総打鍵数をカウント
  if (e.key.length === 1) {
    totalKeyStrokes++;
  }

  if (!currentRoma) return;

  if (!hasStartedTyping) {
    attemptedCount++;
    hasStartedTyping = true;
  }

  if (key === currentRoma[0]) {
    recordKeyResult(currentRoma[0], false); // Success for this key
    correctCount++; // ★キー正解数をカウント（ここに変更！）

    currentRoma = currentRoma.slice(1);
    displayRoma = displayRoma.replace(/^\s*/, "").slice(1);
    document.getElementById("questionRoma").textContent = displayRoma;

    // 次のキーをハイライト
    if (currentRoma.length > 0) {
      if (window.highlightFutureNextKey) highlightFutureNextKey(currentRoma[0]);
      if (window.highlightNextKey) highlightNextKey(currentRoma[0]);
    }

    if (currentRoma.length === 0) {
      // 単語クリア時のカウントは廃止（キー単位カウントにしたため）
      currentIndex++;

      if (currentIndex >= problems.length) {
        endTest();
      } else {
        showProblem();
      }
    }
  } else {
    // Miss
    if (e.key.length === 1) {
      recordKeyResult(currentRoma[0], true); // Miss for this target key
    }
  }
});

/* =========================
   下キーボード用イベントリスナー (Press Feedback)
========================= */
document.addEventListener("keydown", e => {
  if (!document.getElementById("futureKeyboardBox")) return;

  const key = e.key.toUpperCase();
  let target = document.querySelector(`#futureKeyboardBox .key[data-key="${key}"]`);

  if (e.key === "Backspace") target = document.querySelector(`#futureKeyboardBox .key[data-key="✕"]`);
  if (e.key === " ") target = document.querySelector(`#futureKeyboardBox .key[data-key="Space"]`);
  if (e.key === "-") target = document.querySelector(`#futureKeyboardBox .key[data-key="-"]`);

  if (target) target.classList.add("pressed");
});

document.addEventListener("keyup", e => {
  if (!document.getElementById("futureKeyboardBox")) return;
  const key = e.key.toUpperCase();
  let target = document.querySelector(`#futureKeyboardBox .key[data-key="${key}"]`);

  if (e.key === "Backspace") target = document.querySelector(`#futureKeyboardBox .key[data-key="✕"]`);
  if (e.key === " ") target = document.querySelector(`#futureKeyboardBox .key[data-key="Space"]`);
  if (e.key === "-") target = document.querySelector(`#futureKeyboardBox .key[data-key="-"]`);

  if (target) target.classList.remove("pressed");
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
   苦手特訓モード
========================= */
async function startWeaknessTest() {
  const stats = JSON.parse(localStorage.getItem("neotyping_stats") || "{}");
  let keys = Object.keys(stats).filter(k => stats[k].total >= 5);

  if (keys.length === 0) {
    alert("まだ十分なデータがありません。通常モードで練習してください。");
    return;
  }

  keys.sort((a, b) => {
    const rateA = stats[a].miss / stats[a].total;
    const rateB = stats[b].miss / stats[b].total;
    return rateB - rateA;
  });

  const weakKeys = keys.slice(0, 5);

  if (weakKeys.length === 0 || stats[weakKeys[0]].miss === 0) {
    alert("苦手なキーが見つかりません（正解率が高いです）。");
    return;
  }

  document.getElementById("questionHira").textContent = "データを分析中...";

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

  const targetProblems = allProblems.filter(p => {
    const romaUpper = p.roma.toUpperCase();
    return weakKeys.some(wk => romaUpper.includes(wk));
  });

  if (targetProblems.length === 0) {
    alert("該当する問題が見つかりませんでした。");
    return;
  }

  problems = targetProblems.sort(() => Math.random() - 0.5);

  startTest(); // startTestで初期化されるので直接呼ぶ

  alert(`【苦手特訓開始】\n苦手キー: ${weakKeys.join(", ")}\n関連問題数: ${problems.length}問`);
}

/* =========================
   初期化
========================= */
async function init() {
  const params = new URLSearchParams(location.search);
  const level = params.get("level") || "syokyu";

  let problemText = "";
  try {
    const res = await fetch(`${level}.txt`);
    if (!res.ok) throw new Error("Fetch failed");
    problemText = await res.text();
  } catch (e) {
    console.warn("ローカル環境またはファイルが見つからないため、ダミー問題を使用します。");
    problemText = `あ,a\nい,i\nう,u\nえ,e\nお,o`;
  }

  problems = problemText.trim().split("\n").map(l => {
    const [h, r] = l.split(",");
    return { hira: h, roma: r };
  });

  setUI("idle");

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

  const weakBtn = document.getElementById("startWeakness");
  if (weakBtn) {
    weakBtn.addEventListener("click", e => {
      e.preventDefault();
      startWeaknessTest();
    });
  }

  initSettingsPanel();
}

/* =========================
   設定パネル制御
========================= */
function initSettingsPanel() {
  const settings = JSON.parse(localStorage.getItem("keyboardSettings") || "{}");

  const chkTopPress = document.getElementById("chk-top-press");
  const chkTopGuide = document.getElementById("chk-top-guide");
  const chkTopHeat = document.getElementById("chk-top-heat");

  const chkBtmPress = document.getElementById("chk-btm-press");
  const chkBtmGuide = document.getElementById("chk-btm-guide");
  const chkBtmHeat = document.getElementById("chk-btm-heat");

  if (settings.topPress === undefined) settings.topPress = true;
  if (settings.topGuide === undefined) settings.topGuide = false;
  if (settings.topHeat === undefined) settings.topHeat = false;

  if (settings.btmPress === undefined) settings.btmPress = false;
  if (settings.btmGuide === undefined) settings.btmGuide = true;
  if (settings.btmHeat === undefined) settings.btmHeat = false;

  if (chkTopPress) chkTopPress.checked = settings.topPress;
  if (chkTopGuide) chkTopGuide.checked = settings.topGuide;
  if (chkTopHeat) chkTopHeat.checked = settings.topHeat;

  if (chkBtmPress) chkBtmPress.checked = settings.btmPress;
  if (chkBtmGuide) chkBtmGuide.checked = settings.btmGuide;
  if (chkBtmHeat) chkBtmHeat.checked = settings.btmHeat;

  function applySettings() {
    const currentSettings = {
      topPress: chkTopPress ? chkTopPress.checked : true,
      topGuide: chkTopGuide ? chkTopGuide.checked : false,
      topHeat: chkTopHeat ? chkTopHeat.checked : false,
      btmPress: chkBtmPress ? chkBtmPress.checked : false,
      btmGuide: chkBtmGuide ? chkBtmGuide.checked : true,
      btmHeat: chkBtmHeat ? chkBtmHeat.checked : false
    };
    localStorage.setItem("keyboardSettings", JSON.stringify(currentSettings));

    const kbBox = document.getElementById("keyboardBox");
    const futureBox = document.getElementById("futureKeyboardBox");
    const stats = JSON.parse(localStorage.getItem("neotyping_stats") || "{}");

    if (kbBox) {
      if (currentSettings.topGuide) kbBox.classList.remove("no-guide");
      else kbBox.classList.add("no-guide");

      if (currentSettings.topPress) kbBox.classList.remove("no-press");
      else kbBox.classList.add("no-press");

      if (currentSettings.topHeat) {
        if (window.applyHeatmap) window.applyHeatmap(stats);
      } else {
        const keys = kbBox.querySelectorAll(".key");
        keys.forEach(k => {
          k.className = k.className.replace(/heatmap-level-\d/g, "").trim();
          k.classList.add('heatmap-level-0');
          k.style.background = "";
          k.style.color = "";
        });
        const overlays = kbBox.querySelectorAll(".miss-overlay");
        overlays.forEach(o => o.remove());
      }
    }

    if (futureBox) {
      if (currentSettings.btmPress) futureBox.classList.remove("no-press");
      else futureBox.classList.add("no-press");

      if (currentSettings.btmGuide) futureBox.classList.remove("no-guide");
      else futureBox.classList.add("no-guide");

      if (currentSettings.btmHeat) {
        if (window.applyFutureHeatmap) window.applyFutureHeatmap(stats);
      } else {
        if (window.applyFutureHeatmap) window.applyFutureHeatmap({});
      }
    }
  }

  const allChks = [chkTopPress, chkTopGuide, chkTopHeat, chkBtmPress, chkBtmGuide, chkBtmHeat];
  allChks.forEach(chk => {
    if (chk) chk.addEventListener("change", applySettings);
  });

  applySettings();
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

window.addEventListener("DOMContentLoaded", init);
