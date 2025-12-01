let problems = [];
let currentIndex = 0;
let currentHira = "";
let currentRoma = "";   // 判定用（スペース除去）
let displayRoma = "";   // 表示用（スペース保持）

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

  currentIndex = 0;
  showProblem();
}

function showProblem() {
  const p = problems[currentIndex];
  currentHira = p.hira;
  displayRoma = p.roma;
  currentRoma = p.roma.replace(/\s+/g, "");

  document.getElementById("questionHira").textContent = currentHira;
  document.getElementById("questionRoma").textContent = displayRoma;
}

document.addEventListener("keydown", function(e) {
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
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % problems.length;
        showProblem();
      }, 0);
    }
  }
});

const params = new URLSearchParams(window.location.search);
loadProblems(params.get("level") || "syokyu");
