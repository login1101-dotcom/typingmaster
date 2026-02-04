document.addEventListener("DOMContentLoaded", async () => {
  // ▼ 表示先（index.html にある想定）
  const counterEls = document.querySelectorAll("#visit-counter");

  // 表示先がなければ何もしない
  if (!counterEls.length) return;

  /* =========================
     ローカル環境（localhost）
  ========================= */
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

  /* =========================
     本番（Cloudflare Workers）
  ========================= */
  try {
    const res = await fetch(
      "https://counter-app.english-phonics.workers.dev/?app=typingmaster",
      { cache: "no-store" }
    );

    const data = await res.json();
    const count = Number(data.count);
    const today = Number(data.today); // 新しく追加された今日のカウント

    counterEls.forEach(el => {
      if (Number.isFinite(count)) {
        // 今日が有効ならカッコ書きで追加、なければ累計のみ
        const todayStr = Number.isFinite(today) ? ` (本日: ${today})` : "";
        el.textContent = `訪問数：${count}${todayStr}`;
      } else {
        el.textContent = `訪問数：--`;
      }
    });

  } catch (e) {
    console.error(e);
    counterEls.forEach(el => {
      el.textContent = `訪問数：--`;
    });
  }
});
