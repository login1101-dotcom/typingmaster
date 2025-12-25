import os

# Target Directory
DIRECTORY = "/Users/jono/Desktop/rebirth_project/typingmaster_github_clone"

# Files to force center alignment for ALL content
TARGET_FILES = {"contact.html", "privacy.html"}

# CSS to force center alignment
FORCE_CENTER_CSS = """
<style>
/* 強制的に全てのテキストを中央寄せにする */
.content-card, .content-card p, .content-card h1, .content-card h2, .content-card h3, .content-card div, .content-card span {
  text-align: center !important;
}
/* 左寄せになりがちなリストも中央へ */
.content-card ul, .content-card ol {
  text-align: center !important;
  list-style-position: inside; /* マーカーも一緒に中央へ */
}
</style>
"""

def force_center_text():
    for filename in TARGET_FILES:
        filepath = os.path.join(DIRECTORY, filename)
        
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
        except:
            print(f"Skipping {filename} (read error)")
            continue

        original = content
        
        # We append this CSS at the end of the head (or just before </head>)
        # so it overrides everything else because of !important and order.
        if "</head>" in content:
            # Check if likely already added (simple string check)
            if "/* 強制的に全てのテキストを中央寄せにする */" not in content:
                content = content.replace("</head>", FORCE_CENTER_CSS + "\n</head>")
        
        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated: {filename}")
        else:
            print(f"No changes for {filename}")

if __name__ == "__main__":
    force_center_text()
