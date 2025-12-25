import os
import re

# Target Directory
DIRECTORY = "/Users/jono/Desktop/rebirth_project/typingmaster_github_clone"

# Files to center H1
CENTER_H1_FILES = {"home.html", "about.html", "contact.html", "privacy.html"}

# Files to fix container class (contact/privacy)
CONTAINER_FIX_FILES = {"contact.html", "privacy.html"}

def refine_styles():
    count_h1 = 0
    count_class = 0
    
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
        
        # 1. Fix .container -> .content-card (For contact/privacy)
        if filename in CONTAINER_FIX_FILES:
            if 'class="container"' in content:
                content = content.replace('class="container"', 'class="content-card"')
                print(f"Fixed container class in {filename}")

        # 2. Center H1 title (For explicit list of pages)
        # Regex to find <h1>Title</h1> and add style="text-align: center;"
        if filename in CENTER_H1_FILES:
            # Check if h1 already has style
            # Pattern: <h1( attributes)?>
            def h1_replacer(match):
                attrs = match.group(1) or ""
                if "style=" in attrs:
                    # Append or modify style? Adding text-align: center if not present
                    if "text-align" not in attrs:
                         # Simple replace for existing style
                         return match.group(0).replace('style="', 'style="text-align: center; ')
                    return match.group(0)
                else:
                    return f'<h1{attrs} style="text-align: center;">'

            content = re.sub(r'<h1([^>]*)>', h1_replacer, content, flags=re.IGNORECASE)
        
        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            
    print("Refinement Complete.")

if __name__ == "__main__":
    refine_styles()
