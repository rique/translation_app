import hashlib
import os
from bs4 import BeautifulSoup, NavigableString
import re


def is_valid_text(text):
    """
    Returns False if the text looks like broken HTML, 
    CSS, or just empty noise.
    """
    clean_text = text.strip()
    
    # 1. Skip if it's too short (like just a > or /)
    if len(clean_text) < 2:
        return False
        
    # 2. Skip if it starts with a closing bracket or looks like a partial tag
    # This catches things like "/tr>", "br />", etc.
    if re.match(r'^[/>\\<]+', clean_text):
        return False
        
    # 3. Skip if it looks like a CSS property (e.g., "color: #fff;")
    if ":" in clean_text and clean_text.endswith(";"):
        return False

    return True


def create_skeleton(filename, source_dir, skeleton_dir):
    path = os.path.join(source_dir, filename)
    with open(path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
    
    mapping = []
    occurrence_tracker = {} # Track duplicate strings

    for node in soup.find_all(string=True):
        if isinstance(node, NavigableString) and node.strip():
            if node.parent.name in ['script', 'style']: continue
            
            original_text = node.strip()

            if not is_valid_text(original_text):
                continue
            # Create a base hash
            base_hash = hashlib.md5(original_text.encode()).hexdigest()[:8]
            
            # Increment counter for this specific string content
            occurrence_tracker[base_hash] = occurrence_tracker.get(base_hash, 0) + 1
            
            # Unique key: hash + occurrence count (e.g., t_854e5fbe_1)
            unique_key = f"t_{base_hash}_{occurrence_tracker[base_hash]}"
            
            mapping.append({"key": unique_key, "original": original_text})
            node.replace_with(f"{{{{{unique_key}}}}}")

    os.makedirs(skeleton_dir, exist_ok=True)
    skeleton_path = os.path.join(skeleton_dir, filename)
    with open(skeleton_path, 'w', encoding='utf-8') as f:
        f.write(str(soup))
    return mapping


def build_translated_file(skeleton_path, output_path, translations, lang_key):
    with open(skeleton_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for row in translations:
        val = row[lang_key]
        if val:
            content = content.replace(f"{{{{{row['key']}}}}}", val)
            
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)