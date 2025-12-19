const keyboardLayout = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "^", "¥", "✕"],
  ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "@", "[", "Enter"],
  ["Ctrl", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", ":", "]", "Enter"],
  ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "_", "Shift"],
  ["Caps", "Opt", "Cmd", "英数", "Space", "かな", "Cmd", "fn"]
];

function normalizeKey(key) {
  if (key === "Control") return "Ctrl";
  if (key === "Meta") return "Cmd";
  if (key === "Alt") return "Opt";
  if (key === "CapsLock") return "Caps";
  if (key === " ") return "Space";
  if (key === "Lang2") return "英数";
  if (key === "Lang1") return "かな";
  return key;
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
   ★ 修正ポイントはここだけ
   上のキーボード専用に限定
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

createKeyboard();
