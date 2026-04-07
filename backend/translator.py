import re
import os
import deepl
from dotenv import load_dotenv
from googletrans import Translator as GoogleTranslator

# Load variables from .env file
load_dotenv()

DEEPL_API_KEY = os.getenv("DEEPL_API_KEY")

# Initialize engines once
google_translator = GoogleTranslator()

# Only initialize DeepL if the key exists
deepl_translator = None

if DEEPL_API_KEY:
    deepl_translator = deepl.Translator(DEEPL_API_KEY)

def translate_text(text, target_lang, provider="google"):
    if not text or text.strip() == "":
        return ""
    print(f'Using provider {provider=}')
    # Logic switch based on UI choice
    if provider == "deepl" and deepl_translator:
        return translate_with_deepl(text, target_lang)
    else:
        return translate_with_google(text, target_lang)

def translate_with_deepl(text, target_lang):
    """DeepL uses built-in XML tag handling to protect variables"""
    try:
        # DeepL expects 'ES' or 'FR' (uppercase)
        # It also differentiates 'EN-US' vs 'EN-GB', but for target ES/FR it's simple
        lang_map = {"es": "ES", "fr": "FR"}
        target = lang_map.get(target_lang.lower(), target_lang.upper())

        # 1. PROTECT: Wrap ALL [@variables] in one go using Regex
        # This prevents the "double-wrap" or "missing" bug from the for-loop
        protected_text = re.sub(r'(\[@.*?\])', r'<ignore>\1</ignore>', text)

        # 2. Call DeepL API
        result = deepl_translator.translate_text(
            protected_text, 
            target_lang=target,
            tag_handling="xml",
            ignore_tags=["ignore"]
        )
        
        # 3. CLEAN: Remove the tags from the final result
        # We use regex here too just to be safe with potential spaces the API might add
        translated_text = result.text.replace("<ignore>", "").replace("</ignore>", "")
        
        return translated_text
    except Exception as e:
        print(f"DeepL Error: {e}")
        return text

def translate_with_google(text, target_lang):
    """Google requires manual placeholder replacement to protect variables"""
    try:
        placeholders = re.findall(r'(\[@.*?\])', text)
        temp_text = text
        for i, ph in enumerate(placeholders):
            # Google is more likely to mess up <ignore>, so we use <i0>, <i1>...
            temp_text = temp_text.replace(ph, f"<{i}>")

        result = google_translator.translate(temp_text, src='en', dest=target_lang)
        translated_text = result.text

        for i, ph in enumerate(placeholders):
            translated_text = translated_text.replace(f"<{i}>", ph)
            translated_text = translated_text.replace(f"< {i} >", ph) # Fix API-added spaces

        return translated_text
    except Exception as e:
        print(f"Google Error: {e}")
        return text