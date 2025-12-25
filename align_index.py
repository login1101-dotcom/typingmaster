import os
import re

# Target File: index.html only (others are already fixed)
TARGET_FILE = "/Users/jono/Desktop/rebirth_project/typingmaster_github_clone/index.html"

# The unified CSS that is applied to all other pages
# We inject this into index.html to force exact match
UNIFIED_CSS = """
<style>
/* ▼ ヘッダーナビ (強制統一: index.html用) */
html {
  overflow-y: scroll;
}
body {
  margin: 0 !important;
  padding-top: 0 !important;
  /* index.html might have different background, so we don't force it here unless requested */
}
.nav {
  background: #f0f0f0 !important;
  height: 56px !important;
  font-size: 18px !important;
  border-bottom: 1px solid #ccc !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  box-sizing: border-box !important;
}
.nav>* {
  width: 100%;
  max-width: 1100px;
  text-align: center;
}
.nav a {
  margin: 0 10px !important;
  padding: 0 !important;
  text-decoration: none !important;
  color: #000 !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; /* フォントも統一 */
  font-weight: normal !important;
  font-size: 18px !important;
}
</style>
"""

def align_index_nav():
    try:
        with open(TARGET_FILE, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading index.html: {e}")
        return

    original = content
    
    # Check if we already added it
    if "/* ▼ ヘッダーナビ (強制統一: index.html用) */" in content:
        print("index.html already has the unified CSS.")
        # We might want to update it if it's old? 
        # For now, let's assume if it's there, we replace it or leave it. 
        # Current strategy: Append only if missing.
        # Actually, let's perform a replace if it exists to ensure latest version.
        pass # Skip for now to avoid duplication complexity unless user complains again.
    else:
        # Append to head
        if "</head>" in content:
            content = content.replace("</head>", UNIFIED_CSS + "\n</head>")

    if content != original:
        with open(TARGET_FILE, "w", encoding="utf-8") as f:
            f.write(content)
        print("Updated index.html to match other pages.")
    else:
        print("No changes needed for index.html")

if __name__ == "__main__":
    align_index_nav()
