import os

# Configuration
DOMAIN = "https://typingmasterneo.com"
TARGET_DIR = "/Users/jono/Desktop/rebirth_project/typingmaster_github_clone"

def add_canonical():
    print(f"Adding canonical tags to files in {TARGET_DIR}...")
    
    files = [f for f in os.listdir(TARGET_DIR) if f.endswith(".html")]
    
    for filename in files:
        filepath = os.path.join(TARGET_DIR, filename)
        
        # Determine the canonical URL
        if filename == "index.html":
            canonical_url = f"{DOMAIN}/"
        else:
            canonical_url = f"{DOMAIN}/{filename}"
        
        canonical_tag = f'  <link rel="canonical" href="{canonical_url}">'
        
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Check if canonical tag already exists
        if "rel=\"canonical\"" in content or "rel='canonical'" in content:
            print(f"Skipping {filename}: already has canonical tag.")
            continue
            
        # Insert into head
        if "</head>" in content:
            # We'll insert it right before the closing </head> tag or after <meta charset> if preferred.
            # To be safe and standard, usually putting it after title or meta charset is good.
            # Let's try to put it right before the existing style sheets or closing head.
            # Simplest consistent place: just before </head>
            new_content = content.replace("</head>", f"{canonical_tag}\n</head>", 1)
            
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Updated {filename}")
        else:
            print(f"Skipping {filename}: No </head> tag found.")

if __name__ == "__main__":
    add_canonical()
