const futureKeyboardLayout = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "^", "¥", "✕"],
  ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "@", "[", "Enter"],
  ["Ctrl", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", ":", "]", "Enter"],
  ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "_", "Shift"],
  ["Caps", "Opt", "Cmd", "英数", "Space", "かな", "Cmd", "fn"]
];

/* =========================
   指割り当て表（未来キーボード専用）
========================= */
const fingerMap = {
  // 左手
  "1": "left-pinky", "q": "left-pinky", "a": "left-pinky", "z": "left-pinky",
  "Tab": "left-pinky", "Caps": "left-pinky", "Shift": "left-pinky",

  "2": "left-ring", "w": "left-ring", "s": "left-ring", "x": "left-ring",
  "3": "left-middle", "e": "left-middle", "d": "left-middle", "c": "left-middle",

  "4": "left-index", "5": "left-index",
  "r": "left-index", "t": "left-index",
  "f": "left-index", "g": "left-index",
  "v": "left-index", "b": "left-index",

  // 右手
  "6": "right-index", "7": "right-index",
  "y": "right-index", "u": "right-index",
  "h": "right-index", "j": "right-index",
  "n": "right-index", "m": "right-index",

  "8": "right-middle", "i": "right-middle", "k": "right-middle", ",": "right-middle",
  "9": "right-ring", "o": "right-ring", "l": "right-ring", ".": "right-ring",

  "0": "right-pinky", "-": "right-pinky", "^": "right-pinky", "¥": "right-pinky",
  "p": "right-pinky", "@": "right-pinky", "[": "right-pinky",
  ";": "right-pinky", ":": "right-pinky", "]": "right-pinky",
  "/": "right-pinky", "_": "right-pinky",
  "Enter": "right-pinky",

  // 親指
  "Space": "thumb"
};

function normalizeFutureKey(key) {
  if (key === "Control") return "Ctrl";
  if (key === "Meta") return "Cmd";
  if (key === "Alt") return "Opt";
  if (key === "CapsLock") return "Caps";
  if (key === " ") return "Space";
  if (key === "Lang2") return "英数";
  if (key === "Lang1") return "かな";
  return key;
}

/* =========================
   未来キーボード生成
========================= */
function createFutureKeyboard() {
  const box = document.getElementById("futureKeyboardBox");
  if (!box) return;

  box.innerHTML = "";

  futureKeyboardLayout.forEach((rowKeys, rowIndex) => {
    const row = document.createElement("div");
    row.className = `row row-${rowIndex + 1}`;

    rowKeys.forEach((key) => {
      const keyDiv = document.createElement("div");
      keyDiv.className = "key";
      keyDiv.textContent = key;
      keyDiv.dataset.key = key;
      keyDiv.dataset.row = rowIndex + 1;

      // ★ 指割り当て（未来キーボードのみ）
      if (fingerMap[key]) {
        keyDiv.dataset.finger = fingerMap[key];
      }

      row.appendChild(keyDiv);
    });

    box.appendChild(row);
  });
}

/* =========================
   未来キーボード制御API
========================= */

function clearFutureHighlight() {
  const keys = document.querySelectorAll("#futureKeyboardBox .key.active");
  keys.forEach(k => k.classList.remove("active"));
}

function highlightFutureNextKey(rawKey) {
  clearFutureHighlight();
  if (!rawKey) return;

  let key = normalizeFutureKey(rawKey);
  if (key === "Process") key = "/";

  const targets = document.querySelectorAll(
    `#futureKeyboardBox .key[data-key="${key}"]`
  );
  targets.forEach(k => k.classList.add("active"));
}

/* =========================
   初期化
========================= */
window.addEventListener("DOMContentLoaded", () => {
  createFutureKeyboard();
});
