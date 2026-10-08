#!/usr/bin/env python3
"""
scripts/add_testimonial.py
Automatiza el proceso de agregar testimonios / pantallazos a Furtivo.
- Copia y optimiza la captura a assets/images/testimonials/
- Registra en assets/data/testimonials.json
"""

import os
import sys
import json
import argparse
from PIL import Image

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_DIR = os.path.join(ROOT_DIR, "assets", "images", "testimonials")
JSON_PATH = os.path.join(ROOT_DIR, "assets", "data", "testimonials.json")

def main():
    parser = argparse.ArgumentParser(description="Agregar pantallazo de testimonio a Furtivo")
    parser.add_argument("--type", choices=["google", "whatsapp", "instagram"], required=True, help="Tipo de captura")
    parser.add_argument("--author", required=True, help="Nombre del cliente")
    parser.add_argument("--image", required=True, help="Ruta a la captura")
    parser.add_argument("--highlight", default="", help="Frase destacada o texto")
    parser.add_argument("--time", default="Cliente Verificado", help="Tiempo o fecha (ej: Hace 6 meses)")
    
    args = parser.parse_args()
    
    os.makedirs(ASSETS_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(JSON_PATH), exist_ok=True)
    
    testimonials = []
    if os.path.exists(JSON_PATH):
        try:
            with open(JSON_PATH, "r", encoding="utf-8") as f:
                testimonials = json.load(f)
        except Exception:
            testimonials = []
            
    idx = len([t for t in testimonials if t.get("type") == args.type]) + 1
    ext = os.path.splitext(args.image)[1].lower() or ".jpg"
    dest_filename = f"review-{args.type}-{idx}{ext}"
    dest_path = os.path.join(ASSETS_DIR, dest_filename)
    
    # Optimizar imagen
    with Image.open(args.image) as img:
        img = img.convert("RGB")
        w, h = img.size
        aspect = "horizontal" if w > h else "vertical"
        if w > 1200:
            img.thumbnail((1200, 1600), Image.Resampling.LANCZOS)
        img.save(dest_path, "JPEG" if ext in [".jpg", ".jpeg"] else "PNG", quality=90, optimize=True)
        print(f"  ✓ Guardada imagen: {dest_path} ({img.size[0]}x{img.size[1]})")
        
    source_map = {
        "google": "Google Maps",
        "whatsapp": "WhatsApp Real",
        "instagram": "Instagram DM"
    }
    
    new_entry = {
        "id": f"{args.type}-{idx}",
        "type": args.type,
        "author": args.author,
        "rating": 5,
        "time": args.time,
        "source": source_map.get(args.type, args.type.title()),
        "image": f"assets/images/testimonials/{dest_filename}",
        "highlight": args.highlight,
        "aspect": aspect
    }
    
    testimonials.append(new_entry)
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(testimonials, f, indent=2, ensure_ascii=False)
        
    print(f"  ✓ Registrado en {JSON_PATH}")
    print("✅ Testimonio agregado exitosamente.")

if __name__ == "__main__":
    main()
