import os
import re

TARGET_FILE = "/Users/jono/Desktop/rebirth_project/typingmaster_github_clone/about.html"

def move_intro_text():
    with open(TARGET_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    # The text to move (now strictly matching what we updated)
    # Note: We just updated it to タイピングマスターネオ
    text_snippet = "「タイピングマスターネオ」は、日本語タイピングの練習を目的とした無料のオンライン学習サービスです。ブラインドタッチ（タッチタイピング）を習得したい全ての方に向けて、効率的で楽しい学習環境を提供することを目指しています。"
    
    # 1. Remove the text from the top (likely inside the first <p> after <h1>)
    # We use regex to find <p>...text...</p>
    # Since whitespace might vary, we normalize space in regex or just search carefully
    
    # Simple strategy: Find the exact string in context of <p> tag
    # The text might have newlines in the file
    content_clean = content # work on copy
    
    # Find the paragraph containing the text.
    # It starts with <p> and contains "「タイピングマスターネオ」は、"
    # match <p>\s*「タイピングマスターネオ」は、.*?</p>
    p_regex = re.compile(r'<p>\s*「タイピングマスターネオ」は、.*?</p>', re.DOTALL)
    
    match = p_regex.search(content)
    if not match:
        print("Could not find the target paragraph to move.")
        # Debug: print first 500 chars
        # print(content[:500])
        return

    full_p_tag = match.group(0) # This is the <p> block we want to move
    
    # Remove it from current location
    content = content.replace(full_p_tag, "")
    
    # 2. Insert it after <h2>サイトの目的</h2>
    # Find <h2>サイトの目的</h2>
    if "<h2>サイトの目的</h2>" in content:
        # Insert after the closing </h2>
        content = content.replace("<h2>サイトの目的</h2>", "<h2>サイトの目的</h2>\n    " + full_p_tag)
        
        with open(TARGET_FILE, "w", encoding="utf-8") as f:
            f.write(content)
        print("Moved text to 'サイトの目的' section.")
    else:
        print("Could not find <h2>サイトの目的</h2> tag.")

if __name__ == "__main__":
    move_intro_text()
