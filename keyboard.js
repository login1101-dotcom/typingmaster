const keyboardLayout = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "^", "¥", "✕"],
  ["Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "@", "[", "Enter"],
  ["Ctrl", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", ":", "]", "Enter"],
  ["Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "_", "Shift"],
  ["Caps", "Opt", "Cmd", "英数", "Space", "かな", "Cmd", "FN"]
];

function normalizeKey(key) {
  if (key === "Control") return "Ctrl";
  if (key === "Meta") return "Cmd";
  if (key === "Alt") return "Opt";
  if (key === "CapsLock") return "Caps";
  if (key === " ") return "Space";
  if (key === "Lang2") return "英数";
  if (key === "Lang1") return "かな";
  return key.toUpperCase();
}

function createKeyboard() {
  const keyboardBox = document.getElementById("keyboardBox");
  keyboardBox.innerHTML = "";

  keyboardLayout.forEach((rowKeys, rowIndex) => {
    const row = document.createElement("div");
    row.className = `row row-${rowIndex + 1}`;

    rowKeys.forEach((key) => {
      const keyDiv = document.createElement("div");
      keyDiv.className = "key";
      keyDiv.textContent = key;
      keyDiv.dataset.key = key;
      keyDiv.dataset.row = rowIndex + 1;
      row.appendChild(keyDiv);
    });

    keyboardBox.appendChild(row);
  });
}

/* =========================
   上キーボード専用ハイライト
========================= */
function highlightKey(key, active) {
  const keys = document.querySelectorAll(
    `#keyboardBox .key[data-key="${key}"]`
  );
  keys.forEach(k => {
    if (active) k.classList.add("active");
    else k.classList.remove("active");
  });
}

document.addEventListener("keydown", (e) => {
  let key = normalizeKey(e.key);

  if (key === "Process") key = "/";

  if (key === "Tab") {
    e.preventDefault();
    highlightKey("Tab", true);
    return;
  }

  if (key === "/") {
    e.preventDefault();
    highlightKey("/", true);
    return;
  }

  if (key === "Backspace") {
    e.preventDefault();
    highlightKey("✕", true);
    return;
  }

  highlightKey(key, true);
});

document.addEventListener("keyup", (e) => {
  const key = normalizeKey(e.key);

  if (key === "Tab" || key === "/" || key === "Backspace") {
    highlightKey(key === "Backspace" ? "✕" : key, false);
    return;
  }

  highlightKey(key, false);
});

/* =========================
   レベルごとのガイド表示
========================= */
function applyLevelGuide(level) {
  // キーボード1 (#keyboardBox) のみのガイドを消去
  document.querySelectorAll('#keyboardBox .key').forEach(k => {
    k.classList.remove('guide-index', 'guide-middle', 'guide-ring', 'guide-pinky', 'guide-thumb');
  });

  // フィンガーグループ定義（未来キーボードの構成に完全一致させる）
  const fingers = {
    index: ["4", "R", "F", "V", "5", "T", "G", "B", "6", "Y", "H", "N", "7", "U", "J", "M"],
    middle: ["3", "E", "D", "C", "8", "I", "K", ","],
    ring: ["2", "W", "S", "9", "O", "L", "."],
    pinky: ["1", "Q", "A", "Z", "0", "P", ";", "/", "-", "^", "¥", "@", "[", ":", "]", "_", "Tab", "Shift", "Enter", "Ctrl", "X"],
    thumb: []
  };

  let targetGroups = [];

  // レベルごとに表示するグループを選択
  if (level === "syokyu" || level === "syokyu1") {
    targetGroups = ["index"];
  } else if (level === "syokyu2") {
    targetGroups = ["index", "middle"];
  } else if (level.startsWith("cyukyu")) {
    targetGroups = ["index", "middle", "ring"];
    const aKeys = document.querySelectorAll(`#keyboardBox .key[data-key="A"]`);
    aKeys.forEach(div => div.classList.add('guide-pinky'));
  } else if (level.startsWith("jyokyu")) {
    targetGroups = ["index", "middle", "ring", "pinky", "thumb"];
  }

  // キーボード1の対象キーに、指に応じたクラスを付与
  targetGroups.forEach(groupName => {
    const keysInGroup = fingers[groupName];
    const className = `guide-${groupName}`;

    keysInGroup.forEach(k => {
      const divs = document.querySelectorAll(`#keyboardBox .key[data-key="${k}"]`);
      divs.forEach(div => div.classList.add(className));
    });
  });
}

/* =========================
   ヒートマップ表示
========================= */
function applyHeatmap(stats) {
  const allKeys = document.querySelectorAll("#keyboardBox .key");

  allKeys.forEach(kDiv => {
    let char = kDiv.dataset.key;
    if (char === "Space") return;

    const recordKey = char.toUpperCase();

    const data = stats[recordKey];
    if (data && data.total > 0) {
      const missRate = data.miss / data.total;

      const oldOverlay = kDiv.querySelector(".miss-overlay");
      if (oldOverlay) oldOverlay.remove();

      if (missRate > 0) {
        const alpha = Math.min(0.8, missRate + 0.1);
        kDiv.style.backgroundColor = `rgba(255, 0, 0, ${alpha})`;
        kDiv.style.color = "white";

        const overlay = document.createElement("div");
        overlay.className = "miss-overlay";
        overlay.style.position = "absolute";
        overlay.style.bottom = "2px";
        overlay.style.right = "2px";
        overlay.style.fontSize = "10px";
        overlay.style.fontWeight = "bold";
        overlay.textContent = `${Math.floor(missRate * 100)}%`;
        kDiv.appendChild(overlay);
      } else {
        kDiv.style.backgroundColor = "#e6ffe6";
        kDiv.style.color = "#333";
      }
    } else {
      kDiv.style.backgroundColor = "";
      kDiv.style.color = "";
      const oldOverlay = kDiv.querySelector(".miss-overlay");
      if (oldOverlay) oldOverlay.remove();
    }
  });
}

createKeyboard();
