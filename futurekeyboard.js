const futureKeyboardLayout = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "^", "¥", "✕"],
  ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "@", "[", "Enter"],
  ["Ctrl", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", ":", "]", "Enter"],
  ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "_", "Shift"],
  ["Caps", "Opt", "Cmd", "英数", "Space", "かな", "Cmd", "fn"]
];

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
      row.appendChild(keyDiv);
    });

    box.appendChild(row);
  });
}

/* =========================
   未来キーボード制御API
========================= */

/* 全消灯 */
function clearFutureHighlight() {
  const keys = document.querySelectorAll("#futureKeyboardBox .key.active");
  keys.forEach(k => k.classList.remove("active"));
}

/* 指定された1キーだけ光らせる */
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
