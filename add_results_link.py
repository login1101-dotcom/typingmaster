import os
import re

DIRECTORY = "/Users/jono/Desktop/rebirth_project/typingmaster_github_clone"

# Updated Nav HTML with "成長分析ボード"
NEW_NAV_HTML = """
  <!-- ナビゲーション -->
  <div class="nav">
    <a href="index.html">Topへ</a> |
    <a href="home.html">ブラインドタッチとは</a> |
    <a href="about.html">このサイトについて</a> |
    <a href="results.html">成長分析ボード</a> |
    <a href="contact.html">お問い合わせ</a> |
    <a href="privacy.html">プライバシーポリシー</a>
    <span id="visit-counter" style="margin-left:10px;">訪問数：--</span>
  </div>
"""

# Regex to find existing Nav block
NAV_REGEX = re.compile(r'<div class="nav">.*?</div>', re.DOTALL | re.IGNORECASE)

def update_menu_with_results():
    count = 0
    updates = []
    
    for filename in os.listdir(DIRECTORY):
        if not filename.endswith(".html"):
            continue
            
        filepath = os.path.join(DIRECTORY, filename)
        
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
        except:
            continue

        original = content
        
        if NAV_REGEX.search(content):
            # Replace with new nav
            content = NAV_REGEX.sub(NEW_NAV_HTML.strip(), content)
        else:
            # Should exist, but if not, ignore or warn
            pass
        
        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            updates.append(filename)
            count += 1
            
    print(f"Total updated: {count}")

if __name__ == "__main__":
    update_menu_with_results()
