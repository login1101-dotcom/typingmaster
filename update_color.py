import os

# Target Directory
DIRECTORY = "/Users/jono/Desktop/rebirth_project/typingmaster_github_clone"
TARGET_FILES = {"contact.html", "privacy.html"}

# Color to apply (based on previous CSS observations for green theme)
TITLE_COLOR = "#00796b"

# CSS to inject/update
COLOR_CSS = f"""
<style>
/* タイトル色変更 (緑色) */
.content-card h1 {{
  color: {TITLE_COLOR} !important;
}}
</style>
"""

def update_title_color():
    for filename in TARGET_FILES:
        filepath = os.path.join(DIRECTORY, filename)
        
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
        except:
            continue
            
        original = content
        
        # We append this short CSS snippet to the head
        if "</head>" in content:
            if "/* タイトル色変更 (緑色) */" not in content:
                 content = content.replace("</head>", COLOR_CSS + "\n</head>")
        
        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated color in {filename}")
        else:
             print(f"No changes (CSS likely already exists) in {filename}")

if __name__ == "__main__":
    update_title_color()
