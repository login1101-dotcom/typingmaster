import os
import re

# Target Directory
DIRECTORY = "/Users/jono/Desktop/rebirth_project/typingmaster_github_clone"

# Updated Navigation HTML ("Topへ" link included)
# We keep this because user wanted "Topへ"
NAV_HTML = """
  <!-- ナビゲーション -->
  <div class="nav">
    <a href="index.html">Topへ</a> |
    <a href="home.html">ブラインドタッチとは</a> |
    <a href="about.html">このサイトについて</a> |
    <a href="contact.html">お問い合わせ</a> |
    <a href="privacy.html">プライバシーポリシー</a>
    <span id="visit-counter" style="margin-left:10px;">訪問数：--</span>
  </div>
"""

# Reset CSS: REMOVE the destructive layout CSS
# Only keep minimal Nav styling
MINIMAL_NAV_CSS = """
<style>
/* ▼ ヘッダーナビ (Reset & Minimal) */
body {
  margin: 0 !important;
  padding-top: 0 !important;
}
.nav {
  background: #f0f0f0;
  height: 56px;
  font-size: 18px;
  border-bottom: 1px solid #ccc;
  display: flex !important;
  align-items: center;
  justify-content: center;
  margin: 0 !important;
  width: 100%;
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
/* 白カードやレイアウトへの干渉を削除 */
</style>
"""

# Regex pattern to find the CSS block we added previously
# It started with <style> and contained "/* ▼ コンテンツカード/メインフレームの位置・幅統一 */"
BAD_CSS_MARKER = "/* ▼ コンテンツカード/メインフレームの位置・幅統一 */"

def fix_pages():
    count = 0
    updates = []
    
    for filename in os.listdir(DIRECTORY):
        if not filename.endswith(".html"):
            continue
            
        filepath = os.path.join(DIRECTORY, filename)
        
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception as e:
            print(f"Skipping {filename}: {e}")
            continue

        original = content
        
        # 1. Remove the BAD CSS block completely
        # Matches <style> ... marker ... </style> (non-greedy)
        style_regex = re.compile(r"<style>.*?" + re.escape(BAD_CSS_MARKER) + r".*?</style>", re.DOTALL)
        content = style_regex.sub("", content)

        # 2. Insert MINIMAL CSS for Nav (if bad css was removed, we need new nav css)
        # OR if we just want to ensure nav looks okay.
        # Check if we have minimal css.
        if "/* ▼ ヘッダーナビ (Reset & Minimal) */" not in content:
            if "</head>" in content:
                content = re.sub(r"(</head>)", MINIMAL_NAV_CSS + r"\n\1", content, flags=re.IGNORECASE)
        
        # 3. Ensure Top Link exists in Nav (re-verify)
        if '<div class="nav">' in content:
             # Just replace current nav with correct NAV_HTML to be sure
             nav_regex = re.compile(r'<div class="nav">.*?</div>', re.DOTALL | re.IGNORECASE)
             content = nav_regex.sub(NAV_HTML.strip(), content)

        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            updates.append(filename)
            count += 1
            
    print(f"Total updated: {count}")
    print(f"Files: {updates}")

if __name__ == "__main__":
    fix_pages()
