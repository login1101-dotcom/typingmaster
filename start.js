let count = localStorage.getItem("visitCount");
if (!count) count = 0;
count++;
localStorage.setItem("visitCount", count);
document.getElementById("counter").textContent = "訪問数：" + count;
