import os
import re

# Target Directory
DIRECTORY = "/Users/jono/Desktop/rebirth_project/typingmaster_github_clone"

# Nagivation HTML to insert (Same as before)
NEW_NAV_HTML = """
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

# Updated Style: margin-top reduced to 10px
LAYOUT_CSS = """
<style>
/* ▼ ヘッダーナビ (強制上書き) */
.nav {
  background: #f0f0f0;
  height: 56px;
  font-size: 18px;
  border-bottom: 1px solid #ccc;
  display: flex !important;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
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

/* ▼ コンテンツカード/メインフレームの位置・幅統一 */
.content-card, .mainframe-container, .index-layout, body > center, body > div[style*="width: 800px"] {
  max-width: 900px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  /* メニューバーとの間隔を 10px に縮小 */
  margin-top: 10px !important;
  box-sizing: border-box;
}

/* mainframe.html adjustment */
#game-area {
  margin-top: 10px;
}
</style>
"""

NAV_REGEX = re.compile(r'<div class="nav">.*?</div>', re.DOTALL | re.IGNORECASE)

def update_all_pages():
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
        
        # 1. Update Navigation Bar (Same)
        match = NAV_REGEX.search(content)
        if match:
             content = NAV_REGEX.sub(NEW_NAV_HTML.strip(), content)
        else:
            body_match = re.search(r"<body[^>]*>", content, re.IGNORECASE)
            if body_match:
                end = body_match.end()
                content = content[:end] + "\n" + NEW_NAV_HTML + content[end:]
        
        # 2. Update Layout CSS (Replace the previous one)
        # We look for the previous CSS block and replace it, or append if not found
        # Previous CSS identifier: "/* ▼ コンテンツカード/メインフレームの位置・幅統一 */"
        
        # Regex to capture the Style block containing our marker
        # Matches <style> ... marker ... </style>
        css_marker = "/* ▼ コンテンツカード/メインフレームの位置・幅統一 */"
        style_regex = re.compile(r"<style>.*?" + re.escape(css_marker) + r".*?</style>", re.DOTALL)
        
        match_style = style_regex.search(content)
        if match_style:
             # Replace existing style block with new one
             content = style_regex.sub(LAYOUT_CSS.strip(), content)
        else:
             # If not found (maybe first run or different format), append to head
             if "</head>" in content:
                content = re.sub(r"(</head>)", LAYOUT_CSS + r"\n\1", content, flags=re.IGNORECASE)
        
        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            updates.append(filename)
            count += 1
            
    print(f"Total updated: {count}")
    print(f"Files: {updates}")

if __name__ == "__main__":
    update_all_pages()
