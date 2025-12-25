import os
import re

# Target Directory
DIRECTORY = "/Users/jono/Desktop/rebirth_project/typingmaster_github_clone"

# Force Font Consistency CSS
# We will inject this into ALL pages.
FONT_FIX_CSS = """
<style>
/* ▼ ナビゲーションのフォント統一 (ズレ防止) */
.nav, .nav a, .nav span {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif !important;
  font-weight: normal !important;
}
</style>
"""

def fix_nav_font_alignment():
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
        
        # Determine if we need to add the font fix.
        # We'll just append it to the head to be sure it overrides everything.
        # Simple check to avoid infinite duplication
        if "/* ▼ ナビゲーションのフォント統一 (ズレ防止) */" not in content:
            if "</head>" in content:
                content = content.replace("</head>", FONT_FIX_CSS + "\n</head>")
        
        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            updates.append(filename)
            count += 1
            
    print(f"Total updated: {count}")
    print(f"Files: {updates}")

if __name__ == "__main__":
    fix_nav_font_alignment()
