/* =========================
   UI制御
========================= */
function setUI(state) {
  const left = document.getElementById("uiLeft");
  const center = document.getElementById("uiCenter");
  const right = document.getElementById("uiRight");

  left.innerHTML = `<a href="index.html" class="btn-home">戻る</a>`;
  right.innerHTML = `<a href="results.html?level=${currentLevel}&time=${timeLimit}" class="btn-result">結果</a>`;
  center.innerHTML = "";

  if (state === "before") {
    center.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;justify-content:center;">
        <span style="font-weight:bold;">制限時間を選択</span>
        <select id="timeSelect">${generateTimeOptions()}</select>
        <a href="#" id="startBtn" class="btn-start">スタート</a>
      </div>
    `;
    document.getElementById("startBtn").onclick = startTest;
  }

  if (state === "during") {
    center.innerHTML = `<span id="timerDisplay"></span>`;
    updateTimerDisplay();
  }

  if (state === "after") {
    const score = correctCount * 10;
    const accuracy = attemptedCount
      ? Math.floor((correctCount / attemptedCount) * 100)
      : 0;

    center.innerHTML = `
      <span>得点：${score}</span>
      <span style="margin-left:16px;">正解数：${correctCount}</span>
      <span style="margin-left:16px;">実施数：${attemptedCount}</span>
      <span style="margin-left:16px;">正解率：${accuracy}%</span>
    `;

    // 終了メッセージはCSS疑似要素に任せる
    document.getElementById("questionHira").textContent = "";
    document.getElementById("questionRoma").innerHTML = `
      <div style="margin-top:24px;display:flex;gap:16px;justify-content:center;">
        <a href="#" id="retrySame" class="btn-home">この条件で再テスト</a>
        <a href="mainframe.html?level=${currentLevel}&mode=test" class="btn-home">
          条件変更して再テスト
        </a>
      </div>
    `;

    document.getElementById("retrySame").onclick = () => {
      remainingTime = timeLimit;
      correctCount = 0;
      attemptedCount = 0;
      currentIndex = 0;
      isGameStarted = true;

      setUI("during");

      timerInterval = setInterval(() => {
        remainingTime--;
        updateTimerDisplay();
        if (remainingTime <= 0) endTest();
      }, 1000);

      showProblem();
    };
  }
}
