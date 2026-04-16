"""
extract_historico.py
────────────────────
Extrae los precios de todas las sesiones históricas de la Lonja de Sevilla
y los guarda en Supabase.

Requisitos:
    pip install anthropic supabase requests

Uso:
    python extract_historico.py

Variables de entorno necesarias (o editar directamente abajo):
    ANTHROPIC_API_KEY
    SUPABASE_URL
    SUPABASE_SERVICE_KEY
"""

import os, re, time, base64, json, requests
from datetime import datetime

# ── Configuración ─────────────────────────────────────────────────────────────
ANTHROPIC_API_KEY   = os.environ.get("ANTHROPIC_API_KEY",   "TU_CLAVE_AQUI")
SUPABASE_URL        = os.environ.get("SUPABASE_URL",        "https://vriqawhaickizakkaicc.supabase.co")
SUPABASE_SERVICE_KEY= os.environ.get("SUPABASE_SERVICE_KEY","TU_SERVICE_KEY_AQUI")
LONJA_ID            = "sevilla"

MESES = {
    "01":"enero","02":"febrero","03":"marzo","04":"abril",
    "05":"mayo","06":"junio","07":"julio","08":"agosto",
    "09":"septiembre","10":"octubre","11":"noviembre","12":"diciembre"
}

# Todas las fechas de sesión conocidas
SESSION_DATES = [
    "2015-02-17","2015-03-03","2015-03-24","2015-04-14","2015-05-05","2015-05-26",
    "2015-06-02","2015-06-09","2015-06-16","2015-06-23","2015-06-30","2015-07-07",
    "2015-07-14","2015-07-21","2015-07-28","2015-08-04","2015-08-18","2015-09-01",
    "2015-09-15","2015-09-29","2015-10-13","2015-10-27","2015-11-10","2015-11-24",
    "2015-12-09","2015-12-22","2016-01-12","2016-01-26","2016-02-09","2016-02-23",
    "2016-03-08","2016-03-29","2016-04-19","2016-05-03","2016-05-17","2016-05-31",
    "2016-06-07","2016-06-14","2016-06-28","2016-07-05","2016-07-19","2016-08-02",
    "2016-08-23","2016-09-06","2016-09-20","2016-10-05","2016-10-18","2016-10-25",
    "2016-11-08","2016-11-22","2016-11-29","2016-12-13","2017-01-10","2017-01-17",
    "2017-01-31","2017-02-14","2017-03-07","2017-03-21","2017-04-04","2017-04-25",
    "2017-05-23","2017-05-31","2017-06-06","2017-06-13","2017-06-20","2017-07-04",
    "2017-07-18","2017-07-25","2017-08-01","2017-08-22","2017-09-05","2017-09-19",
    "2017-10-03","2017-10-17","2017-10-31","2017-11-14","2017-11-28","2017-12-19",
    "2018-01-09","2018-01-23","2018-02-06","2018-02-20","2018-03-06","2018-03-20",
    "2018-04-03","2018-04-25","2018-05-08","2018-05-22","2018-06-05","2018-06-12",
    "2018-06-19","2018-06-26","2018-07-03","2018-07-10","2018-07-17","2018-07-24",
    "2018-08-07","2018-09-04","2018-09-18","2018-10-02","2018-10-16","2018-10-30",
    "2018-11-13","2018-11-27","2018-12-11","2019-01-15","2019-01-29","2019-02-12",
    "2019-02-26","2019-03-12","2019-03-26","2019-04-09","2019-04-23","2019-05-14",
    "2019-05-21","2019-06-04","2019-06-11","2019-06-18","2019-06-25","2019-07-09",
    "2019-07-16","2019-07-23","2019-08-13","2019-08-27","2019-09-10","2019-09-24",
    "2019-10-08","2019-10-22","2019-11-05","2019-11-19","2019-12-03","2019-12-17",
    "2020-01-07","2020-02-04","2020-02-18","2020-03-24","2020-04-07","2020-04-21",
    "2020-05-05","2020-05-19","2020-05-26","2020-06-02","2020-06-09","2020-06-16",
    "2020-06-23","2020-06-30","2020-07-07","2020-07-14","2020-07-21","2020-07-28",
    "2020-08-11","2020-08-25","2020-09-08","2020-09-22","2020-10-06","2020-10-20",
    "2020-11-03","2020-11-17","2020-12-01","2020-12-15","2021-01-12","2021-01-26",
    "2021-02-09","2021-02-23","2021-03-09","2021-03-23","2021-04-06","2021-04-20",
    "2021-05-04","2021-05-18","2021-05-25","2021-06-01","2021-06-08","2021-06-15",
    "2021-06-22","2021-06-29","2021-07-06","2021-07-13","2021-07-20","2021-07-27",
    "2021-08-10","2021-08-17","2021-08-24","2021-08-31","2021-09-07","2021-09-14",
    "2021-09-21","2021-10-05","2021-10-19","2021-11-02","2021-11-16","2021-11-30",
    "2021-12-14","2022-01-11","2022-01-25","2022-02-08","2022-02-22","2022-03-22",
    "2022-04-08","2022-04-28","2022-05-17","2022-05-31","2022-06-07","2022-06-14",
    "2022-06-21","2022-06-28","2022-07-05","2022-07-12","2022-07-19","2022-07-26",
    "2022-08-02","2022-08-09","2022-08-23","2022-08-30","2022-09-06","2022-09-13",
    "2022-09-20","2022-09-27","2022-10-04","2022-10-11","2022-10-19","2022-10-25",
    "2022-11-08","2022-11-29","2022-12-13","2023-01-10","2023-01-23","2023-02-07",
    "2023-02-21","2023-03-07","2023-03-21","2023-04-11","2023-05-03","2023-05-16",
    "2023-05-23","2023-05-30","2023-06-06","2023-06-13","2023-06-20","2023-06-27",
    "2023-07-04","2023-07-11","2023-07-18","2023-07-25","2023-08-01","2023-08-08",
    "2023-08-29","2023-09-05","2023-09-12","2023-09-19","2023-10-03","2023-10-18",
    "2023-10-31","2023-11-14","2023-11-28","2023-12-12","2024-01-16","2024-01-30",
    "2024-02-20","2024-03-05","2024-03-19","2024-04-02","2024-04-23","2024-05-07",
    "2024-05-21","2024-05-28","2024-06-04","2024-06-11","2024-06-18","2024-06-25",
    "2024-07-02","2024-07-09","2024-07-16","2024-07-23","2024-07-30","2024-08-06",
    "2024-08-20","2024-09-03","2024-09-17","2024-09-24","2024-10-01","2024-10-08",
    "2024-10-15","2024-10-29","2024-11-12","2024-11-26","2024-12-10","2024-12-17",
    "2025-01-07","2025-01-14","2025-01-28","2025-02-11","2025-02-25","2025-03-11",
    "2025-03-25","2025-04-08","2025-04-29","2025-05-13","2025-05-27","2025-06-03",
    "2025-06-10","2025-06-17","2025-06-24","2025-07-01","2025-07-08","2025-07-15",
    "2025-07-22","2025-07-29","2025-08-12","2025-08-26","2025-09-09","2025-09-16",
    "2025-09-23","2025-09-30","2025-10-07","2025-10-21","2025-11-04","2025-11-18",
    "2025-12-02","2025-12-16","2026-01-13","2026-01-27","2026-02-17","2026-03-03",
    "2026-03-10","2026-03-17","2026-03-24","2026-04-07",
]

PROMPT = """Extrae los precios de cereales y oleaginosas de este PDF de la Lonja de Sevilla.
Devuelve SOLO JSON válido, sin markdown, sin texto adicional.
Usa el valor numérico de la columna COTIZACION ACTUAL (€/Tonelada).
Si un producto pone S/O, S/C, o no aparece, usa null.

Mapeo exacto de filas del PDF a claves JSON:
- TRIGO BLANDO · Grupo 1 (Prot>=13%...) → tbn_g1
- TRIGO BLANDO · Grupo 2 (Prot>=12%...) → tbn_g2
- TRIGO BLANDO · Grupo 3 (Prot>=11%...) → tbn_g3
- TRIGO BLANDO · Grupo 4 (Prot>10%...) → tbn_g4
- TRIGO BLANDO · Grupo 5: PIENSO → tbn_pienso
- Pienso IMPORTACION Origen Puerto → ti_pienso
- TRIGO DURO · Grupo 1 (Prot>=13%, PE>=80...) → tdn_g1
- TRIGO DURO · Grupo 2 (Prot>=12%, PE>=78...) → tdn_g2
- TRIGO DURO · Grupo 3 (Prot>=11%, PE>=77...) → tdn_g3
- TRIGO DURO · Grupo 4 El resto → tdn_g4
- TRITICALE · Nacional → trit_nac
- TRITICALE · IMPORTACION Origen Puerto → trit_imp
- AVENA · Nacional → avena_nac
- AVENA · IMPORTACION Origen Puerto → avena_imp
- CEBADA · Igual y más de 64 → cebada_nac
- CEBADA · IMPORTACION Origen Puerto → cebada_imp
- MAIZ · Nacional → maiz_nac
- MAIZ · IMPORTACION Origen Puerto → maiz_imp
- HABAS · Nacional → habas_nac
- HABAS · IMPORTACION Origen Puerto → habas_imp
- GUISANTES · Nacional → guisan_nac
- GUISANTES · IMPORTACION Origen Puerto → guisan_imp
- GIRASOL · Alto oleico >=80% → girasol_alto
- GIRASOL · Girasol Convencional → girasol_conv
- COLZA · 9-2-42 → colza

{
  "tbn_g1":null,"tbn_g2":null,"tbn_g3":null,"tbn_g4":null,"tbn_pienso":null,
  "tdn_g1":null,"tdn_g2":null,"tdn_g3":null,"tdn_g4":null,
  "ti_pienso":null,
  "cebada_nac":null,"cebada_imp":null,
  "trit_nac":null,"trit_imp":null,
  "avena_nac":null,"avena_imp":null,
  "maiz_nac":null,"maiz_imp":null,
  "habas_nac":null,"habas_imp":null,
  "guisan_nac":null,"guisan_imp":null,
  "girasol_alto":null,"girasol_conv":null,
  "colza":null
}"""


def scrape_all_pdf_urls():
    """
    Obtiene todos los enlaces a PDFs desde lonjadesevilla.com/cotizaciones/
    Devuelve dict {fecha_str: url} donde fecha_str es YYYY-MM-DD
    """
    import re as re2
    from html.parser import HTMLParser

    MESES_INV = {v: k for k, v in MESES.items()}
    # Variantes con mayúscula inicial y todo mayúsculas
    for k, v in list(MESES_INV.items()):
        MESES_INV[k.capitalize()] = v
        MESES_INV[k.upper()] = v
    # Septiembre con S mayúscula especial
    MESES_INV["Septiembre"] = "09"

    print("\n→ Descargando índice de cotizaciones...")
    all_links = {}  # {date_str: url}

    years = ["2026","2025","2024","2023","2022","2021","2020",
             "2019","2018","2017","2016","2015"]

    for year in years:
        url = f"https://lonjadesevilla.com/cotizaciones/"
        # The page uses ?year= or tab parameter - try fetching with year param
        # First try the main page for current year, then try with year in URL
        try_urls = [
            f"https://lonjadesevilla.com/cotizaciones/?anyo={year}",
            f"https://lonjadesevilla.com/cotizaciones/?year={year}",
            f"https://lonjadesevilla.com/cotizaciones/",
        ]

        html = None
        for turl in try_urls:
            try:
                r = requests.get(turl, timeout=20,
                    headers={"User-Agent": "Mozilla/5.0"})
                if r.ok and len(r.text) > 500:
                    html = r.text
                    break
            except:
                continue

        if not html:
            print(f"  ✗ No se pudo obtener página para {year}")
            continue

        # Find all PDF links
        pdf_links = re2.findall(r'href=["\']([^"\']*\.pdf)["\']', html, re2.IGNORECASE)
        year_links = [l for l in pdf_links if f"/{year}/" in l or f"_{year}.pdf" in l.lower()]

        print(f"  {year}: {len(year_links)} PDFs encontrados")

        for link in year_links:
            # Parse date from filename
            # Patterns: de_DD_de_MES_YYYY or de_DD_de_MES_de_YYYY or DD_de_MES_YYYY
            fname = link.split("/")[-1].replace(".pdf","")
            # Try to extract day, month, year from filename
            m1 = re2.search(r'(\d{1,2})_de_([a-zA-Z]+)_(?:de_)?(\d{4})', fname, re2.IGNORECASE)
            if m1:
                dd, mes_str, yy = m1.group(1), m1.group(2), m1.group(3)
                mes_num = MESES_INV.get(mes_str.lower()) or MESES_INV.get(mes_str)
                if mes_num:
                    date_str = f"{yy}-{mes_num}-{dd.zfill(2)}"
                    full_url = link if link.startswith("http") else "https://lonjadesevilla.com" + link
                    all_links[date_str] = full_url

    print(f"\n  Total PDFs indexados: {len(all_links)}")
    return all_links


def download_pdf(url):
    """Descarga el PDF y devuelve bytes o None si no existe"""
    try:
        r = requests.get(url, timeout=30,
            headers={"User-Agent": "Mozilla/5.0"})
        ct = r.headers.get("content-type","")
        if r.status_code == 200 and ("pdf" in ct or len(r.content) > 10000):
            return r.content
        return None
    except Exception as e:
        print(f"    Error descarga: {e}")
        return None


def extract_with_claude(pdf_bytes):
    """Extrae precios del PDF usando Claude — envía como base64 con betas header"""
    b64 = base64.b64encode(pdf_bytes).decode()
    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "pdfs-2024-09-25",
        "content-type": "application/json",
    }
    body = {
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 800,
        "messages": [{
            "role": "user",
            "content": [
                {
                    "type": "document",
                    "source": {
                        "type": "base64",
                        "media_type": "application/pdf",
                        "data": b64
                    }
                },
                {"type": "text", "text": PROMPT}
            ]
        }]
    }
    r = requests.post(
        "https://api.anthropic.com/v1/messages",
        json=body, headers=headers, timeout=90
    )
    if not r.ok:
        print(f"    API error {r.status_code}: {r.text[:200]}")
    r.raise_for_status()
    text = "".join(b.get("text","") for b in r.json()["content"])
    text = re.sub(r"```json|```", "", text).strip()
    return json.loads(text)


def save_to_supabase(date_str, prices):
    """Guarda los precios en Supabase via REST API"""
    rows = [
        {"lonja_id": LONJA_ID, "session_date": date_str, "product_key": k, "price": v}
        for k, v in prices.items() if v is not None
    ]
    if not rows:
        return 0
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }
    r = requests.post(f"{SUPABASE_URL}/rest/v1/prices", json=rows, headers=headers, timeout=20)
    r.raise_for_status()
    return len(rows)


def get_existing_dates():
    """Obtiene las fechas que ya están en Supabase para no repetir"""
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    }
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/prices?lonja_id=eq.{LONJA_ID}&select=session_date",
        headers=headers, timeout=20
    )
    r.raise_for_status()
    return set(row["session_date"] for row in r.json())


def delete_all_sevilla():
    """Borra todos los datos de sevilla en Supabase para empezar de cero"""
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    }
    r = requests.delete(
        f"{SUPABASE_URL}/rest/v1/prices?lonja_id=eq.{LONJA_ID}",
        headers=headers, timeout=20
    )
    r.raise_for_status()
    print("  ✓ Datos anteriores borrados")


# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys
    reset_mode = "--reset" in sys.argv

    print("=" * 60)
    print("Extracción histórica · Lonja de Sevilla")
    print("=" * 60)

    # Verificar configuración
    if "TU_CLAVE" in ANTHROPIC_API_KEY or "TU_SERVICE" in SUPABASE_SERVICE_KEY:
        print("\n⚠️  Configura tus claves al inicio del script o como variables de entorno:")
        print("   ANTHROPIC_API_KEY=sk-ant-...")
        print("   SUPABASE_SERVICE_KEY=eyJ...")
        exit(1)

    if reset_mode:
        print("\n→ Modo RESET: borrando todos los datos anteriores de Sevilla...")
        delete_all_sevilla()

    print("\n→ Consultando fechas ya procesadas en Supabase...")
    existing = get_existing_dates()
    print(f"  Ya procesadas: {len(existing)} sesiones")

    # Obtener URLs reales desde la web de la Lonja
    pdf_index = scrape_all_pdf_urls()

    # Cruzar con SESSION_DATES
    pending = []
    for d in SESSION_DATES:
        if d not in existing:
            if d in pdf_index:
                pending.append((d, pdf_index[d]))
            else:
                print(f"  ⚠ Sin URL para {d} — no aparece en el índice web")

    print(f"  Pendientes con URL encontrada: {len(pending)} sesiones")

    if not pending:
        print("\n✓ Todo el histórico ya está cargado.")
        exit(0)

    ok = 0
    failed = []
    not_found = []

    for i, (date, url) in enumerate(pending):
        print(f"\n[{i+1}/{len(pending)}] {date}")
        print(f"  URL: {url}")

        # 1. Descargar PDF
        pdf = download_pdf(url)
        if pdf is None:
            print(f"  ✗ PDF no descargable")
            not_found.append(date)
            continue

        print(f"  ✓ PDF descargado ({len(pdf)//1024} KB)")

        # 2. Extraer con Claude
        try:
            prices = extract_with_claude(pdf)
            n_prices = sum(1 for v in prices.values() if v is not None)
            print(f"  ✓ Extraídos {n_prices} precios")
        except Exception as e:
            print(f"  ✗ Error extracción: {e}")
            failed.append(date)
            time.sleep(3)
            continue

        # 3. Guardar en Supabase
        try:
            saved = save_to_supabase(date, prices)
            print(f"  ✓ Guardados {saved} registros en Supabase")
            ok += 1
        except Exception as e:
            print(f"  ✗ Error Supabase: {e}")
            failed.append(date)

        # Pausa para no saturar la API de Anthropic
        time.sleep(1.5)

    # ── Resumen ───────────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("RESUMEN")
    print("=" * 60)
    print(f"  ✓ Procesadas correctamente: {ok}")
    print(f"  ✗ PDFs no encontrados:      {len(not_found)}")
    print(f"  ✗ Errores de extracción:    {len(failed)}")

    if not_found:
        print(f"\nPDFs no descargables ({len(not_found)}):")
        for d in not_found:
            print(f"  {d}")

    if failed:
        print(f"\nErrores (puedes relanzar el script para reintentar):")
        for d in failed:
            print(f"  {d}")

    print("\nListo. Recarga la web para ver los datos reales.")
