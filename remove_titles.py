import os
import re

DIRECTORY = "/Users/jono/Desktop/rebirth_project/typingmaster_github_clone"

def remove_main_titles():
    # 1. home.html - Remove <h1>ブラインドタッチとは</h1>
    home_path = os.path.join(DIRECTORY, "home.html")
    if os.path.exists(home_path):
        with open(home_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Regex to remove h1 tag even with attributes/styles
        # Needs to match "ブラインドタッチとは" inside
        content = re.sub(r'<h1[^>]*>.*?ブラインドタッチとは.*?</h1>', '', content, flags=re.DOTALL | re.IGNORECASE)
        
        with open(home_path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Removed h1 from home.html")

    # 2. about.html - Remove <h1>このサイトについて</h1>
    about_path = os.path.join(DIRECTORY, "about.html")
    if os.path.exists(about_path):
        with open(about_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        content = re.sub(r'<h1[^>]*>.*?このサイトについて.*?</h1>', '', content, flags=re.DOTALL | re.IGNORECASE)
        
        with open(about_path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Removed h1 from about.html")

if __name__ == "__main__":
    remove_main_titles()
