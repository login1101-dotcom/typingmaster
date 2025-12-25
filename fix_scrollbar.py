import os
import re

# Target Directory
DIRECTORY = "/Users/jono/Desktop/rebirth_project/typingmaster_github_clone"

# Updated CSS with scrollbar fix
SCROLL_FIX_CSS = """
<style>
/* ▼ ヘッダーナビ (Reset & Minimal & Scroll Fix) */
html {
  overflow-y: scroll; /* 常にスクロールバーを表示してズレを防止 */
}
body {
  margin: 0 !important;
  padding-top: 0 !important;
  background: #fdfdfd;
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
</style>
"""

def fix_scrollbar_all_pages():
    count = 0
    updates = []
    
    # Regex to replace existing <style> block we inserted
    # It starts with <style> and contains "/* ▼ ヘッダーナビ (Reset & Minimal"
    style_regex = re.compile(r"<style>\s*/\* ▼ ヘッダーナビ \(Reset.*?/style>", re.DOTALL)

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
        
        # Replace the existing style block with the new one containing scroll fix
        if style_regex.search(content):
            content = style_regex.sub(SCROLL_FIX_CSS.strip(), content)
        else:
            # If for some reason unmatched, try adding it to head
            # (Though previous steps should have added it)
            if "</head>" in content:
                content = content.replace("</head>", SCROLL_FIX_CSS + "\n</head>")

        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            updates.append(filename)
            count += 1
            
    print(f"Total updated: {count}")
    print(f"Files: {updates}")

if __name__ == "__main__":
    fix_scrollbar_all_pages()
