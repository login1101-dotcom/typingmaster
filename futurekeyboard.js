const futureKeyboardLayout = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "^", "¥", "✕"],
  ["Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "@", "[", "Enter"],
  ["Ctrl", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", ":", "]", "Enter"],
  ["Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "_", "Shift"],
  ["Caps", "Opt", "Cmd", "英数", "Space", "かな", "Cmd", "FN"]
];

/* =========================
   指割り当て表（未来キーボード専用）
========================= */
const fingerMap = {
  // 左手
  "1": "left-pinky", "Q": "left-pinky", "A": "left-pinky", "Z": "left-pinky",
  "Tab": "left-pinky", "Shift": "left-pinky", "Ctrl": "left-pinky", "X": "left-pinky",

  "2": "left-ring", "W": "left-ring", "S": "left-ring",
  "3": "left-middle", "E": "left-middle", "D": "left-middle", "C": "left-middle",

  "4": "left-index", "5": "left-index",
  "R": "left-index", "T": "left-index",
  "F": "left-index", "G": "left-index",
  "V": "left-index", "B": "left-index",

  // 右手
  "6": "right-index", "7": "right-index",
  "Y": "right-index", "U": "right-index",
  "H": "right-index", "J": "right-index",
  "N": "right-index", "M": "right-index",

  "8": "right-middle", "I": "right-middle", "K": "right-middle", ",": "right-middle",
  "9": "right-ring", "O": "right-ring", "L": "right-ring", ".": "right-ring",

  "0": "right-pinky", "-": "right-pinky", "^": "right-pinky", "¥": "right-pinky",
  "P": "right-pinky", "@": "right-pinky", "[": "right-pinky",
  ";": "right-pinky", ":": "right-pinky", "]": "right-pinky",
  "/": "right-pinky", "_": "right-pinky",
  "Enter": "right-pinky",
};

function normalizeFutureKey(key) {
  if (key === "Control") return "Ctrl";
  if (key === "Meta") return "Cmd";
  if (key === "Alt") return "Opt";
  if (key === "CapsLock") return "Caps";
  if (key === " ") return "Space";
  if (key === "Lang2") return "英数";
  if (key === "Lang1") return "かな";
  return key.toUpperCase();
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
