import os

DIRECTORY = "/Users/jono/Desktop/rebirth_project/typingmaster_github_clone"

# Negative margin to pull content higher
LIFT_MORE_CSS = """
<style>
/* ▼ コンテンツ位置調整 (もっともっと上へ: マイナスマージン) */
.content-card, .mainframe-container, .index-layout, body > center, body > div[style*="width: 800px"] {
  margin-top: -15px !important; /* マイナスマージンで強制引き上げ */
}
/* コンテンツ内部のパディングも少し詰める */
.content-card {
  padding-top: 10px !important; 
}
</style>
"""

def lift_content_more():
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
        
        if "</head>" in content:
            if "/* ▼ コンテンツ位置調整 (もっともっと上へ: マイナスマージン) */" not in content:
                content = content.replace("</head>", LIFT_MORE_CSS + "\n</head>")
        
        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {filename}")

if __name__ == "__main__":
    lift_content_more()
