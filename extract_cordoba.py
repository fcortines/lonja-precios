"""
extract_cordoba.py
──────────────────
Extrae los precios y volúmenes de la Lonja de Córdoba (Mesa de Cereales).
- Histórico 2012-2019: https://camaracordoba.com/historico-lonja/
- Actual 2020-hoy:     https://camaracordoba.com/lonja-agraria/

Uso:
    python extract_cordoba.py          # solo sesiones pendientes
    python extract_cordoba.py --reset  # borra todo y recarga desde cero
"""

import os, re, time, base64, json, requests
from datetime import date, timedelta

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "TU_CLAVE_AQUI")
DATABASE_URL      = os.environ.get("DATABASE_URL",      "TU_NEON_URL_AQUI")
LONJA_ID          = "cordoba"

PROMPT = """Extrae los precios y volumen de operaciones de este PDF de la Lonja de Córdoba (Mesa de Cereales).
Devuelve SOLO JSON válido, sin markdown, sin texto adicional.
Usa el valor numérico de la columna "€/Tn Agricultor" (la PRIMERA columna de precios).
Si un producto pone S/O, S/C, o no tiene valor, usa null.

Para el volumen de operaciones:
- "A" o "ALTO" → "A"
- "M" o "MEDIO" → "M"
- "B" o "BAJO" → "B"
- vacío, S/O, S/C → null

Mapeo exacto:
- TRIGO DURO GRUPO TD 1 → tdn_g1
- TRIGO DURO GRUPO TD 2 → tdn_g2
- TRIGO DURO GRUPO TD 3 → tdn_g3
- TRIGO DURO GRUPO TD 4 → tdn_g4
- TRIGO BLANDO GRUPO TB 1 → tbn_g1
- TRIGO BLANDO GRUPO TB 2 → tbn_g2
- TRIGO BLANDO GRUPO TB 3 → tbn_g3
- TRIGO BLANDO GRUPO TB 4 → tbn_g4
- TRIGO BLANDO GRUPO TB 5 → tbn_pienso
- TRITICALE → trit_nac
- CEBADA → cebada_nac
- AVENA → avena_nac
- MAIZ → maiz_nac
- SORGO → sorgo_nac
- HABAS → habas_nac
- GIRASOL ALTO OLEICO → girasol_alto
- GIRASOL convencional → girasol_conv
- COLZA → colza
- GUISANTES → guisan_nac

{"prices":{"tbn_g1":null,"tbn_g2":null,"tbn_g3":null,"tbn_g4":null,"tbn_pienso":null,"tdn_g1":null,"tdn_g2":null,"tdn_g3":null,"tdn_g4":null,"trit_nac":null,"cebada_nac":null,"avena_nac":null,"maiz_nac":null,"sorgo_nac":null,"habas_nac":null,"girasol_alto":null,"girasol_conv":null,"colza":null,"guisan_nac":null},"volumes":{"tbn_g1":null,"tbn_g2":null,"tbn_g3":null,"tbn_g4":null,"tbn_pienso":null,"tdn_g1":null,"tdn_g2":null,"tdn_g3":null,"tdn_g4":null,"trit_nac":null,"cebada_nac":null,"avena_nac":null,"maiz_nac":null,"sorgo_nac":null,"habas_nac":null,"girasol_alto":null,"girasol_conv":null,"colza":null,"guisan_nac":null}}"""


def scrape_cordoba_urls():
    all_links = {}
    pages = [
        "https://camaracordoba.com/historico-lonja/",
        "https://camaracordoba.com/lonja-agraria/",
    ]
    for page_url in pages:
        print(f"  Scraping: {page_url}")
        try:
            r = requests.get(page_url, timeout=30,
                headers={"User-Agent": "Mozilla/5.0"})
            r.raise_for_status()
            html = r.text
        except Exception as e:
            print(f"    ✗ Error: {e}")
            continue

        links_raw = re.findall(r'href=["\']([^"\']+\.pdf)["\']', html, re.IGNORECASE)
        for url in links_raw:
            url_lower = url.lower()
            if any(x in url_lower for x in ["citrico","carnic","almendra","bovino","porcino","ovino"]):
                continue
            full_url = url if url.startswith("http") else "https://camaracordoba.com" + url
            date_str = None
            m = re.search(r'(\d{4})(\d{2})(\d{2})(?:\.pdf|_)', url, re.IGNORECASE)
            if m:
                y, mo, d = m.group(1), m.group(2), m.group(3)
                if 2010 <= int(y) <= 2030 and 1 <= int(mo) <= 12 and 1 <= int(d) <= 31:
                    date_str = f"{y}-{mo}-{d}"
            if not date_str:
                m = re.search(r'(\d{4})-(\d{2})-(\d{2})', url)
                if m:
                    y, mo, d = m.group(1), m.group(2), m.group(3)
                    if 2010 <= int(y) <= 2030:
                        date_str = f"{y}-{mo}-{d}"
            if date_str:
                if date_str not in all_links or "cereal" in url_lower:
                    all_links[date_str] = full_url

    print(f"  Total sesiones encontradas: {len(all_links)}")
    return all_links


def get_recent_cordoba_urls():
    """Para GitHub Action: prueba URLs de los últimos martes directamente"""
    today = date.today()
    candidates = {}
    d = today
    for _ in range(20):
        if d.weekday() == 1:  # martes
            date_str = d.strftime("%Y-%m-%d")
            date_compact = d.strftime("%Y%m%d")
            candidates[date_str] = f"https://camaracordoba.com/wp-content/uploads/actas-mesa-de-cereales/Acta-Mesa-de-Cereales-{date_compact}.pdf"
        d -= timedelta(days=1)
    return candidates


def download_pdf(url):
    if not url.lower().endswith(".pdf"):
        return None
    try:
        r = requests.get(url, timeout=30, headers={"User-Agent": "Mozilla/5.0"})
        ct = r.headers.get("content-type", "")
        if r.status_code == 200 and ("pdf" in ct or len(r.content) > 5000):
            return r.content
        return None
    except Exception as e:
        print(f"    Error descarga: {e}")
        return None


def extract_with_claude(pdf_bytes):
    b64 = base64.b64encode(pdf_bytes).decode()
    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "pdfs-2024-09-25",
        "content-type": "application/json",
    }
    body = {
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 1200,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "document", "source": {
                    "type": "base64", "media_type": "application/pdf", "data": b64}},
                {"type": "text", "text": PROMPT}
            ]
        }]
    }
    r = requests.post("https://api.anthropic.com/v1/messages",
        json=body, headers=headers, timeout=90)
    if not r.ok:
        print(f"    API error {r.status_code}: {r.text[:200]}")
    r.raise_for_status()
    text = "".join(b.get("text", "") for b in r.json()["content"])
    text = re.sub(r"```json|```", "", text).strip()
    data = json.loads(text)
    if "prices" in data:
        return data["prices"], data.get("volumes", {})
    return data, {}


def save_to_supabase(date_str, prices, volumes=None):
    if volumes is None:
        volumes = {}
    rows = []
    for k, v in prices.items():
        if v is not None:
            vol = volumes.get(k)
            rows.append((LONJA_ID, date_str, k, v, vol if vol in ("A","M","B") else None))
    if not rows:
        return 0
    import psycopg2
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    cur.executemany("""
        INSERT INTO prices (lonja_id, session_date, product_key, price, volume)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (lonja_id, session_date, product_key)
        DO UPDATE SET price=EXCLUDED.price, volume=EXCLUDED.volume
    """, rows)
    conn.commit()
    cur.close()
    conn.close()
    return len(rows)


def get_existing_dates():
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    }
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/prices?lonja_id=eq.{LONJA_ID}&select=session_date",
        headers=headers, timeout=20)
    r.raise_for_status()
    return set(row["session_date"] for row in r.json())


def delete_all_cordoba():
    import psycopg2
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    cur.execute("DELETE FROM prices WHERE lonja_id=%s", (LONJA_ID,))
    conn.commit()
    cur.close()
    conn.close()
    print("  ✓ Datos anteriores de Córdoba borrados")


if __name__ == "__main__":
    import sys
    reset_mode = "--reset" in sys.argv
    recent_mode = "--recent" in sys.argv

    print("=" * 60)
    print("Extracción · Lonja de Córdoba")
    print("=" * 60)

    if "TU_CLAVE" in ANTHROPIC_API_KEY or "TU_NEON" in DATABASE_URL:
        print("\n⚠️  Configura tus claves")
        exit(1)

    if reset_mode:
        print("\n→ Modo RESET...")
        delete_all_cordoba()

    print("\n→ Consultando fechas ya procesadas...")
    existing = get_existing_dates()
    print(f"  Ya procesadas: {len(existing)} sesiones")

    if recent_mode:
        print("\n→ Modo reciente: buscando sesiones nuevas...")
        pdf_index = get_recent_cordoba_urls()
    else:
        print("\n→ Descargando índice de cotizaciones...")
        pdf_index = scrape_cordoba_urls()

    pending = [(d, pdf_index[d]) for d in sorted(pdf_index.keys()) if d not in existing]
    print(f"  Pendientes: {len(pending)} sesiones")

    if not pending:
        print("\n✓ Todo al día.")
        exit(0)

    ok, failed, not_found = 0, [], []

    for i, (session_date, url) in enumerate(pending):
        print(f"\n[{i+1}/{len(pending)}] {session_date}")
        print(f"  URL: {url}")

        pdf = download_pdf(url)
        if pdf is None:
            print(f"  ✗ PDF no descargable")
            not_found.append(session_date)
            continue
        print(f"  ✓ PDF descargado ({len(pdf)//1024} KB)")

        prices, volumes = None, {}
        for attempt in range(3):
            try:
                prices, volumes = extract_with_claude(pdf)
                n_p = sum(1 for v in prices.values() if v is not None)
                n_v = sum(1 for v in volumes.values() if v is not None)
                print(f"  ✓ Extraídos {n_p} precios, {n_v} volúmenes")
                break
            except Exception as e:
                msg = str(e)
                if "529" in msg or "overloaded" in msg.lower():
                    wait = 30 * (attempt + 1)
                    print(f"  ⚠ API saturada, esperando {wait}s...")
                    time.sleep(wait)
                else:
                    print(f"  ✗ Error extracción: {e}")
                    failed.append(session_date)
                    time.sleep(3)
                    break

        if prices is None:
            if session_date not in failed:
                failed.append(session_date)
            continue

        try:
            saved = save_to_supabase(session_date, prices, volumes)
            print(f"  ✓ Guardados {saved} registros")
            ok += 1
        except Exception as e:
            print(f"  ✗ Error Supabase: {e}")
            failed.append(session_date)

        time.sleep(3)

    print("\n" + "=" * 60)
    print(f"  ✓ OK: {ok}  ✗ No encontrados: {len(not_found)}  ✗ Errores: {len(failed)}")
    if failed:
        print("Fallidas:", failed)

# v2
