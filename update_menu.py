import os
import re

# Target Directory
DIRECTORY = "/Users/jono/Desktop/rebirth_project/typingmaster_github_clone"

# Nagivation HTML to insert
NAV_HTML = """
  <!-- ナビゲーション -->
  <div class="nav">
    <a href="home.html">ブラインドタッチとは</a> |
    <a href="about.html">このサイトについて</a> |
    <a href="contact.html">お問い合わせ</a> |
    <a href="privacy.html">プライバシーポリシー</a>
    <span id="visit-counter" style="margin-left:10px;">訪問数：--</span>
  </div>
"""

# CSS to insert (if start.css is not present)
NAV_CSS = """
<style>
/* ▼ ヘッダーナビ */
.nav {
  background: #f0f0f0;
  height: 56px;
  font-size: 18px;
  border-bottom: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav>* {
  width: 100%;
  max-width: 1100px;
  text-align: center;
}
.nav a {
  margin: 0 10px;
  text-decoration: none;
  color: #000;
}
</style>
"""

# JS script tag to insert
JS_SCRIPT = '\n  <script src="start.js"></script>'

def update_files():
    count = 0
    for filename in os.listdir(DIRECTORY):
        if not filename.endswith(".html"):
            continue
        if filename == "index.html":
            continue
            
        filepath = os.path.join(DIRECTORY, filename)
        
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception as e:
            print(f"Skipping {filename}: {e}")
            continue

        original = content
        
        # 1. Add CSS if start.css and .nav style missing
        if "start.css" not in content and ".nav {" not in content:
            if "</head>" in content:
                content = re.sub(r"(</head>)", NAV_CSS + r"\n\1", content, flags=re.IGNORECASE)
        
        # 2. Add Nav HTML if missing
        if '<div class="nav">' not in content:
            # Insert after <body>
            match = re.search(r"<body[^>]*>", content, re.IGNORECASE)
            if match:
                end = match.end()
                content = content[:end] + "\n" + NAV_HTML + content[end:]
            else:
                if "<body>" in content:
                    content = content.replace("<body>", "<body>\n" + NAV_HTML)
        
        # 3. Add start.js if missing
        if "start.js" not in content:
            if "</body>" in content:
                content = re.sub(r"(</body>)", JS_SCRIPT + r"\n\1", content, flags=re.IGNORECASE)
        
        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated: {filename}")
            count += 1
            
    print(f"Total updated: {count}")

if __name__ == "__main__":
    update_files()
