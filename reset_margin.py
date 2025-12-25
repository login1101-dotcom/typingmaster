import os

DIRECTORY = "/Users/jono/Desktop/rebirth_project/typingmaster_github_clone"

# Reset margin to a balanced value (25px)
RESET_MARGIN_CSS = """
<style>
/* ▼ コンテンツ位置調整 (バランス調整: める込み防止) */
.content-card, .mainframe-container, .index-layout, body > center, body > div[style*="width: 800px"] {
  margin-top: 25px !important; /* めり込まず、離れすぎずの25px */
}
/* コンテンツ内部パディングは通常に戻す */
.content-card {
  padding-top: 20px !important; 
}
</style>
"""

def adjust_margin_correctly():
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
        
        # Replace the aggressive negative margin CSS if found
        # OR just append the new one to override it.
        # It's cleaner to just append new overrider.
        
        if "</head>" in content:
            # We don't check for existence because we want to append a NEW rule that overrides the previous negative margin one.
            # CSS rules added later take precedence if specificity is same.
            content = content.replace("</head>", RESET_MARGIN_CSS + "\n</head>")
        
        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {filename}")

if __name__ == "__main__":
    adjust_margin_correctly()
