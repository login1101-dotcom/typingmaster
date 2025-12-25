import os
import re

# Target Directory
DIRECTORY = "/Users/jono/Desktop/rebirth_project/typingmaster_github_clone"

# Correct Nav HTML
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

# Minimal Nav Style (ensure body margin 0)
NAV_STYLE = """
<style>
/* ▼ ヘッダーナビ (Reset & Minimal) */
body {
  margin: 0 !important;
  padding-top: 0 !important;
  background: #fdfdfd; /* 背景色を追加してカードを目立たせる */
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
/* common.css/start.css will handle content-card styles */
</style>
"""

# Link to start.css
CSS_LINK = '<link rel="stylesheet" href="start.css">'

def fix_pages_final():
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
        
        # 1. Clean up multiple Navs
        # Remove ALL existing nav blocks first (using regex)
        # Regex matches <div class="nav">...</div>
        # Also matching the comment <!-- ナビゲーション --> if present before it
        content = re.sub(r'(<!-- ナビゲーション -->\s*)*<div class="nav">.*?</div>', '', content, flags=re.DOTALL | re.IGNORECASE)
        
        # 2. Insert ONE clean Nav
        # Insert after <body>
        # Also clean up multiple newlines created by removal
        content = re.sub(r'\n{3,}', '\n\n', content)
        
        body_match = re.search(r"<body[^>]*>", content, re.IGNORECASE)
        if body_match:
            end = body_match.end()
            content = content[:end] + "\n" + NAV_HTML + content[end:]
        
        # 3. Add <link rel="stylesheet" href="start.css"> if missing
        # This restores card styles
        if "start.css" not in content:
            if "</head>" in content:
                content = content.replace("</head>", CSS_LINK + "\n</head>")
        
        # 4. Change class="card" to class="content-card" 
        # Because start.css defines .content-card, not .card
        if 'class="card"' in content:
            content = content.replace('class="card"', 'class="content-card"')
        
        # 5. Ensure Nav Style is present (update/replace existing)
        # Remove old style blocks defined by us previously
        content = re.sub(r'<style>\s*/\* ▼ ヘッダーナビ.*?/\* 白カードやレイアウトへの干渉を削除 \*/\s*</style>', '', content, flags=re.DOTALL)
        
        # Add new correct style
        if "</head>" in content:
            content = content.replace("</head>", NAV_STYLE + "\n</head>")

        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            updates.append(filename)
            count += 1
            
    print(f"Total updated: {count}")
    print(f"Files: {updates}")

if __name__ == "__main__":
    fix_pages_final()
