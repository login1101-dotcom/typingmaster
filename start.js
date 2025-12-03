document.addEventListener("DOMContentLoaded", async () => {
  const counterEls = document.querySelectorAll("#counter");

  // 🔹ローカルテスト用カウンタ
  if (location.origin.startsWith("http://localhost")) {
    let count = localStorage.getItem("visitCount");
    if (!count) count = 0;
    count++;
    localStorage.setItem("visitCount", count);

    counterEls.forEach(el => {
      el.textContent = `訪問数：${count}`;
    });
    return;
  }

  // 🔹公開時（Cloudflare Pages）のみ実カウンタ使用
  try {
    const res = await fetch(
      "https://counter-app.english-phonics.workers.dev/?app=typing-app"
    );
    const data = await res.json();

    counterEls.forEach(el => {
      el.textContent =
        (data && typeof data.count === "number")
          ? `訪問数：${data.count}`
          : `訪問数：--`;
    });
  } catch (e) {
    console.error(e);
    counterEls.forEach(el => {
      el.textContent = `訪問数：--`;
    });
  }
});
