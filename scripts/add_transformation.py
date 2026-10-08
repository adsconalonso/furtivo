#!/usr/bin/env python3
"""
scripts/add_transformation.py
Automatiza el proceso de agregar transformaciones de Antes y Después en Furtivo.
- Procesa y copia las fotos a assets/images/before-after/
- Identifica y categoriza por barbero (ej: juan -> Juan Quintero, fernando -> Fernando Carmona)
- Registra la transformación en assets/data/transformations.json
- Inserta o reemplaza el slide en index.html manteniendo atributos y accesibilidad
"""

import os
import sys
import json
import re
import argparse
from PIL import Image

BARBER_MAP = {
    "juan": "Juan Quintero",
    "juan quintero": "Juan Quintero",
    "fernando": "Fernando Carmona",
    "fernando carmona": "Fernando Carmona"
}

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_DIR = os.path.join(ROOT_DIR, "assets", "images", "before-after")
JSON_PATH = os.path.join(ROOT_DIR, "assets", "data", "transformations.json")
INDEX_PATH = os.path.join(ROOT_DIR, "index.html")

def optimize_image(src_path, dest_path, max_width=896, max_height=1200):
    with Image.open(src_path) as img:
        img = img.convert("RGB")
        w, h = img.size
        
        # Check aspect ratio
        ratio = w / h
        # Si la imagen es muy grande, la redimensionamos manteniendo proporción
        if w > max_width or h > max_height:
            img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
        
        img.save(dest_path, "JPEG", quality=88, optimize=True)
        print(f"  ✓ Guardada imagen optimizada: {dest_path} ({img.size[0]}x{img.size[1]})")

def get_next_barber_index(barber_id, transformations):
    count = sum(1 for t in transformations if t.get("barberId") == barber_id)
    return count + 1

def main():
    parser = argparse.ArgumentParser(description="Agregar transformación Antes y Después a Furtivo")
    parser.add_argument("--barber", required=True, help="ID o nombre del barbero (juan / fernando)")
    parser.add_argument("--service", required=True, help="Nombre del corte / servicio")
    parser.add_argument("--before", default=None, help="Ruta a la foto del Antes")
    parser.add_argument("--after", default=None, help="Ruta a la foto del Después")
    parser.add_argument("--latest", action="store_true", help="Tomar automáticamente las 2 fotos más recientes de la carpeta de uploads")
    parser.add_argument("--desc", default="", help="Descripción opcional del corte")
    parser.add_argument("--slide-index", type=int, default=None, help="Índice de slide a reemplazar (1, 2, 3...)")
    
    args = parser.parse_args()
    
    before_path = args.before
    after_path = args.after
    
    if args.latest:
        import glob
        brain_dir = os.path.expanduser("~/.gemini/antigravity-ide/brain")
        user_uploads = []
        for root, dirs, files in os.walk(brain_dir):
            if ".user_uploaded" in root:
                for f in files:
                    if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                        full_p = os.path.join(root, f)
                        user_uploads.append((os.path.getmtime(full_p), full_p))
        user_uploads.sort(reverse=True)
        if len(user_uploads) >= 2:
            # Los dos más recientes (el más antiguo de los 2 es antes, el más nuevo es después, o en orden)
            p1 = user_uploads[1][1]
            p2 = user_uploads[0][1]
            before_path = p1
            after_path = p2
            print(f"  [Auto-detect] Antes: {before_path}")
            print(f"  [Auto-detect] Después: {after_path}")
        else:
            print("  [Error] No se encontraron suficientes fotos en .user_uploaded")
            sys.exit(1)
            
    if not before_path or not after_path:
        print("  [Error] Debes especificar --before y --after, o usar --latest.")
        sys.exit(1)
    
    barber_raw = args.barber.strip().lower()
    barber_id = "juan" if "juan" in barber_raw else ("fernando" if "fernando" in barber_raw else barber_raw)
    barber_name = BARBER_MAP.get(barber_id, args.barber.title())
    
    # Cargar catálogo existente
    os.makedirs(os.path.dirname(JSON_PATH), exist_ok=True)
    os.makedirs(ASSETS_DIR, exist_ok=True)
    
    transformations = []
    if os.path.exists(JSON_PATH):
        try:
            with open(JSON_PATH, "r", encoding="utf-8") as f:
                transformations = json.load(f)
        except Exception:
            transformations = []
            
    # Determinar índice del barbero
    b_idx = get_next_barber_index(barber_id, transformations)
    before_filename = f"before-{barber_id}-{b_idx}.jpg"
    after_filename = f"after-{barber_id}-{b_idx}.jpg"
    
    before_dest = os.path.join(ASSETS_DIR, before_filename)
    after_dest = os.path.join(ASSETS_DIR, after_filename)
    
    print(f"▶ Procesando fotos para {barber_name}...")
    optimize_image(before_path, before_dest)
    optimize_image(after_path, after_dest)
    
    # Relativo para la web
    web_before = f"assets/images/before-after/{before_filename}"
    web_after = f"assets/images/before-after/{after_filename}"
    
    new_entry = {
        "id": f"{barber_id}-{b_idx}",
        "barberId": barber_id,
        "barberName": barber_name,
        "serviceName": args.service,
        "beforeImage": web_before,
        "afterImage": web_after,
        "description": args.desc or f"Corte {args.service} realizado por {barber_name}.",
        "dateAdded": "2026-10-07"
    }
    
    transformations.append(new_entry)
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(transformations, f, indent=2, ensure_ascii=False)
    print(f"  ✓ Registrado en {JSON_PATH}")
    
    # Generar bloque HTML del slide
    slide_html = f'''            <!-- Slide {args.slide_index or len(transformations)} -->
            <div class="swiper-slide">
              <div class="ba-slide" data-barber="{barber_id}" data-barber-name="{barber_name}">
                <div class="ba-comparison" data-ba-comparison>
                  <div class="ba-image ba-image--before">
                    <img src="{web_before}" alt="Antes: {args.service}" loading="lazy" draggable="false" data-barber="{barber_id}">
                    <span class="ba-label ba-label--before">Antes</span>
                  </div>
                  <div class="ba-image ba-image--after">
                    <img src="{web_after}" alt="Después: {args.service} por {barber_name}" loading="lazy" draggable="false" data-barber="{barber_id}">
                    <span class="ba-label ba-label--after">Después</span>
                  </div>
                  <div class="ba-handle" aria-label="Desliza para comparar">
                    <div class="ba-handle__line"></div>
                    <div class="ba-handle__circle">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 4L3 10L7 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 4L17 10L13 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                    <div class="ba-handle__line"></div>
                  </div>
                </div>
                <div class="ba-slide__info">
                  <span class="ba-slide__service">{args.service}</span>
                  <span class="ba-slide__barber">Barbero: {barber_name}</span>
                </div>
              </div>
            </div>'''
            
    # Actualizar index.html
    if os.path.exists(INDEX_PATH):
        with open(INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Si se especificó un slide a reemplazar (o si hay slides de placeholder con before-2.jpg o before-3.jpg)
        target_placeholder = None
        if args.slide_index == 2 or ("before-2.jpg" in content and args.slide_index is None):
            target_placeholder = "before-2.jpg"
            target_slide_num = 2
        elif args.slide_index == 3 or ("before-3.jpg" in content and args.slide_index is None):
            target_placeholder = "before-3.jpg"
            target_slide_num = 3
            
            # Reemplazar el bloque correspondiente
            pattern = re.compile(
                r'<!-- Slide ' + str(target_slide_num) + r' -->.*?(?=(?:<!-- Slide|\s*</div>\s*<div class="ba-swiper-pagination">))',
                re.DOTALL
            )
            match = pattern.search(content)
            if match:
                content = content[:match.start()] + slide_html.strip() + "\n\n" + content[match.end():]
                with open(INDEX_PATH, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"  ✓ Actualizado Slide {target_slide_num} de index.html!")
            else:
                print(f"  [i] No se pudo hacer coincidir la regex exacta para Slide {target_slide_num}, listo para inyección.")
        else:
            # Buscar el final de swiper-wrapper y agregar el nuevo slide antes del cierre
            target_pattern = re.compile(r'(\s*</div>\s*<div class="ba-swiper-pagination"></div>)')
            match = target_pattern.search(content)
            if match:
                content = content[:match.start()] + f'\n\n{slide_html}\n' + content[match.start():]
                print(f"  ✓ Nuevo Slide agregado a index.html!")
                with open(INDEX_PATH, "w", encoding="utf-8") as f:
                    f.write(content)

    print("\n✅ Proceso completado exitosamente.")

if __name__ == "__main__":
    main()
