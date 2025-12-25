import os
import re

# Target Directory
DIRECTORY = "/Users/jono/Desktop/rebirth_project/typingmaster_github_clone"

# New Navigation HTML (Includes "topへ")
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

# Common Style to enforce layout uniformity
# content-card: for articles and info pages
# mainframe: specific fix for mainframe if needed
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
/* すべての主要なコンテナに対してスタイルを適用 */
.content-card, .mainframe-container, .index-layout, body > center, body > div[style*="width: 800px"] {
  max-width: 900px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  /* メニューバーとの間隔を統一 (nav height 56px + margin) */
  margin-top: 40px !important;
  box-sizing: border-box;
}

/* mainframe.html specific adjustment if it uses a different class */
#game-area {
  margin-top: 40px;
}
</style>
"""

# HTML Pattern to find existing nav
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
        
        # 1. Update Navigation Bar
        # Check if nav exists
        match = NAV_REGEX.search(content)
        if match:
            # Replace existing nav
            content = NAV_REGEX.sub(NEW_NAV_HTML.strip(), content)
        else:
            # Insert nav if missing (unlikely, as we just added it, but good for safety)
            # Insert after <body>
            body_match = re.search(r"<body[^>]*>", content, re.IGNORECASE)
            if body_match:
                end = body_match.end()
                content = content[:end] + "\n" + NEW_NAV_HTML + content[end:]
        
        # 2. Add Layout CSS
        # We append this to the HEAD to ensure it overrides previous styles
        # Check if we already added it (simple check)
        if "/* ▼ コンテンツカード/メインフレームの位置・幅統一 */" not in content:
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
