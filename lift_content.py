import os
import re

# Target Directory
DIRECTORY = "/Users/jono/Desktop/rebirth_project/typingmaster_github_clone"

# CSS to shift content up
# 1. content-card margin-top: 0
# 2. h1/h2 margin-top reduction
MOVE_UP_CSS = """
<style>
/* ▼ コンテンツ位置調整 (もっと上へ) */
.content-card, .mainframe-container, .index-layout, body > center, body > div[style*="width: 800px"] {
  max-width: 900px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  margin-top: 0px !important; /* 10px -> 0px */
  box-sizing: border-box;
}

/* タイトルなどの上余白も詰める */
.content-card h1, .content-card h2 {
  margin-top: 10px !important; /* 必要に応じて0にする */
  padding-top: 0 !important;
}

/* mainframe.html adjustment */
#game-area {
  margin-top: 0px !important;
}
</style>
"""

def lift_content_position():
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
        
        # We need to replace or update the previously injected layout CSS.
        # It contained: margin-top: 10px !important;
        # Identifier: /* ▼ コンテンツカード/メインフレームの位置・幅統一 */ (if present)
        # OR just append the new overrides at the very end of HEAD to win priority.
        
        if "</head>" in content:
            if "/* ▼ コンテンツ位置調整 (もっと上へ) */" not in content:
                content = content.replace("</head>", MOVE_UP_CSS + "\n</head>")
        
        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            updates.append(filename)
            count += 1
            
    print(f"Total updated: {count}")
    print(f"Updates: {updates}")

if __name__ == "__main__":
    lift_content_position()
