import os

# Target Directory
DIRECTORY = "/Users/jono/Desktop/rebirth_project/typingmaster_github_clone"

def update_text_content():
    # 1. Update about.html
    about_path = os.path.join(DIRECTORY, "about.html")
    if os.path.exists(about_path):
        with open(about_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Replace site name
        if "「ブラインドタッチマスター」は、" in content:
            content = content.replace("「ブラインドタッチマスター」は、", "「タイピングマスターネオ」は、")
            with open(about_path, "w", encoding="utf-8") as f:
                f.write(content)
            print("Updated about.html")
        else:
            print("Target string not found in about.html")

    # 2. Update home.html
    home_path = os.path.join(DIRECTORY, "home.html")
    if os.path.exists(home_path):
        with open(home_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Remove introduction text
        # <p>ブラインドタッチマスターへようこそ！...しています。</p>
        # We search for the text and the surrounding <p> tags if present, or just the text.
        target_text = "ブラインドタッチマスターへようこそ！このサイトは、楽しくブラインドタッチを習得できる無料タイピング練習アプリです。初心者から上級者まで、自分のレベルに合わせて段階的にスキルアップできる環境を提供しています。"
        
        if target_text in content:
            # Try to remove the enclosing <p> tag if it matches exactly
            # Regex or simple replace includes <p> if strictly formatted
            content = content.replace(f"<p>{target_text}</p>", "")
            # Fallback if <p> has attributes or whitespace
            content = content.replace(target_text, "") 
            
            with open(home_path, "w", encoding="utf-8") as f:
                f.write(content)
            print("Updated home.html")
        else:
            print("Target text not found in home.html")

if __name__ == "__main__":
    update_text_content()
