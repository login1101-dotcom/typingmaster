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

keyboardBox.innerHTML = "";

// キーボード全体を中央寄せするためのスタイル調整
keyboardBox.style.display = "flex";
keyboardBox.style.flexDirection = "column";
keyboardBox.style.alignItems = "center";
// width制限を解除または調整して中央に来るように
keyboardBox.style.width = "100%";

keyboardLayout.forEach((rowKeys, rowIndex) => {
  const row = document.createElement("div");
  row.className = `row row-${rowIndex + 1}`;
  // 行自体も中央寄せ
  row.style.display = "flex";
  row.style.justifyContent = "center";

  rowKeys.forEach((key) => {
    const keyDiv = document.createElement("div");
    keyDiv.className = "key";
    keyDiv.textContent = key;
    keyDiv.dataset.key = key;
    keyDiv.dataset.row = rowIndex + 1;

    // テキスト中央寄せ (CSS側で定義されているが念のためスタイル追加、もしくはclassで制御)
    // keyboard.cssの.keyに対して修正を加える方が綺麗ですが、
    // ここでは動的生成時に念押しするか、keyboard.cssを修正します。
    // 今回はkeyboard.cssを修正するため、ここでのstyle操作は最小限にします。

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
   ヒートマップ表示 (5段階 + 数値中央)
========================= */
function applyHeatmap(stats) {
  const allKeys = document.querySelectorAll("#keyboardBox .key");

  allKeys.forEach(kDiv => {
    let char = kDiv.dataset.key;
    if (char === "Space") return;

    const recordKey = char.toUpperCase();
    const data = stats[recordKey];

    // まずクラスをリセット
    kDiv.classList.remove('heatmap-level-0', 'heatmap-level-1', 'heatmap-level-2', 'heatmap-level-3', 'heatmap-level-4');

    // オーバーレイ削除
    const oldOverlay = kDiv.querySelector(".miss-overlay");
    if (oldOverlay) oldOverlay.remove();

    // スタイルリセット（JSで直接貼っていた場合のため）
    kDiv.style.backgroundColor = "";
    kDiv.style.color = "";

    if (data && data.total > 0) {
      const missRate = data.miss / data.total;

      let level = 0;
      if (missRate > 0) level = 1;
      if (missRate >= 0.2) level = 2;
      if (missRate >= 0.4) level = 3;
      if (missRate >= 0.6) level = 4;

      if (level === 0) {
        kDiv.classList.add('heatmap-level-0');
        // Perfect (Green text?) - handled by CSS or let it be default
        kDiv.style.color = "#15803d"; // Deep Green for perfect
      } else {
        kDiv.classList.add(`heatmap-level-${level}`);

        // 数値表示 (中央下)
        const overlay = document.createElement("div");
        overlay.className = "miss-overlay";
        overlay.textContent = `${Math.floor(missRate * 100)}%`;
        kDiv.appendChild(overlay);
      }
    } else {
      // No Data
      kDiv.classList.add('heatmap-level-0');
    }
  });
}

// 自動実行復活（安全策付き）
window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById("keyboardBox")) {
    createKeyboard();
  }
});
