"""
extract_cordoba.py
──────────────────
Extrae los precios de la Lonja de Córdoba (Mesa de Cereales) y los guarda en Supabase.
- Histórico 2012-2019: https://camaracordoba.com/historico-lonja/
- Actual 2020-hoy:     https://camaracordoba.com/lonja-agraria/

Uso:
    python extract_cordoba.py          # solo sesiones pendientes
    python extract_cordoba.py --reset  # borra todo y recarga desde cero
"""

import os, re, time, base64, json, requests

ANTHROPIC_API_KEY    = os.environ.get("ANTHROPIC_API_KEY",    "TU_CLAVE_AQUI")
SUPABASE_URL         = os.environ.get("SUPABASE_URL",         "https://vriqawhaickizakkaicc.supabase.co")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "TU_SERVICE_KEY_AQUI")
LONJA_ID             = "cordoba"

PROMPT = """Extrae los precios de cereales de este PDF de la Lonja de Córdoba (Mesa de Cereales).
Devuelve SOLO JSON válido, sin markdown, sin texto adicional.
Usa el valor numérico de la columna "€/Tn Agricultor" (la PRIMERA columna de precios, origen Córdoba).
Si un producto pone S/O, S/C, o no tiene valor, usa null.

Mapeo exacto de filas del PDF a claves JSON:
- TRIGO DURO GRUPO TD 1 (Prot>=13%, PE>=80, VIT>80%) → tdn_g1
- TRIGO DURO GRUPO TD 2 (Prot>=12%, PE>=78, VIT>75%) → tdn_g2
- TRIGO DURO GRUPO TD 3 (Prot>=11%, PE>=77, VIT>60%) → tdn_g3
- TRIGO DURO GRUPO TD 4 (Prot<11% / El resto) → tdn_g4
- TRIGO BLANDO GRUPO TB 1 (Prot>=13%, W>=300) → tbn_g1
- TRIGO BLANDO GRUPO TB 2 (Prot>=12%, 200<=W<300) → tbn_g2
- TRIGO BLANDO GRUPO TB 3 (Prot>=11%, 100<=W<200) → tbn_g3
- TRIGO BLANDO GRUPO TB 4 (Prot>10%, 100<W) → tbn_g4
- TRIGO BLANDO GRUPO TB 5 (El resto / Pienso) → tbn_pienso
- TRITICALE → trit_nac
- CEBADA → cebada_nac
- AVENA → avena_nac
- MAIZ → maiz_nac
- SORGO → sorgo_nac
- HABAS → habas_nac
- GIRASOL ALTO OLEICO (>=80%) → girasol_alto
- GIRASOL (convencional 9-2-44) → girasol_conv
- COLZA → colza
- GUISANTES → guisan_nac

{
  "tbn_g1":null,"tbn_g2":null,"tbn_g3":null,"tbn_g4":null,"tbn_pienso":null,
  "tdn_g1":null,"tdn_g2":null,"tdn_g3":null,"tdn_g4":null,
  "trit_nac":null,"cebada_nac":null,"avena_nac":null,
  "maiz_nac":null,"sorgo_nac":null,
  "habas_nac":null,"girasol_alto":null,"girasol_conv":null,
  "colza":null,"guisan_nac":null
}"""


def scrape_cordoba_urls():
    """Obtiene PDFs de cereales de ambas páginas: histórico (2012-2019) y actual (2020-)"""
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

        # Find all PDF links in the page
        # Pattern 1: href="...pdf" with date text DD/MM/YYYY
        links_raw = re.findall(r'href=["\']([^"\']+\.pdf)["\']', html, re.IGNORECASE)

        for url in links_raw:
            url_lower = url.lower()

            # Skip non-cereal links
            if any(x in url_lower for x in ["citrico", "carnic", "almendra", "bovino",
                                              "porcino", "ovino", "citrus"]):
                continue

            full_url = url if url.startswith("http") else "https://camaracordoba.com" + url

            # Try to extract date from URL
            date_str = None

            # Pattern A: YYYYMMDD in filename (2020+): Acta-Mesa-de-Cereales-20240514.pdf
            m = re.search(r'(\d{4})(\d{2})(\d{2})(?:\.pdf|_)', url, re.IGNORECASE)
            if m:
                y, mo, d = m.group(1), m.group(2), m.group(3)
                if 2010 <= int(y) <= 2030 and 1 <= int(mo) <= 12 and 1 <= int(d) <= 31:
                    date_str = f"{y}-{mo}-{d}"

            # Pattern B: YYYY-MM-DD in filename (2019 and some 2020+)
            if not date_str:
                m = re.search(r'(\d{4})-(\d{2})-(\d{2})', url)
                if m:
                    y, mo, d = m.group(1), m.group(2), m.group(3)
                    if 2010 <= int(y) <= 2030:
                        date_str = f"{y}-{mo}-{d}"

            if date_str:
                # Only overwrite if this looks more like a cereal link
                if date_str not in all_links or "cereal" in url_lower:
                    all_links[date_str] = full_url

        # Also handle WordPress page links (some 2022 sessions are pages not PDFs)
        page_links = re.findall(
            r'href=["\']([^"\']+camaracordoba\.com/[^"\']+cereales[^"\']*)["\']',
            html, re.IGNORECASE)
        for link in page_links:
            if link.endswith(".pdf"):
                continue  # already handled above
            m = re.search(r'(\d{4})-(\d{2})-(\d{2})', link)
            if m:
                y, mo, d = m.group(1), m.group(2), m.group(3)
                date_str = f"{y}-{mo}-{d}"
                if date_str not in all_links:
                    all_links[date_str] = link

    print(f"  Total sesiones de cereales: {len(all_links)}")
    return all_links


def get_pdf_from_page(page_url):
    """Para links que son páginas WordPress, busca el PDF embebido"""
    try:
        r = requests.get(page_url, timeout=20,
            headers={"User-Agent": "Mozilla/5.0"})
        if not r.ok:
            return None
        # Find PDF link in page
        pdfs = re.findall(r'href=["\']([^"\']+\.pdf)["\']', r.text, re.IGNORECASE)
        for pdf in pdfs:
            if any(x in pdf.lower() for x in ["cereal", "lonja", "acta", "mesa"]):
                return pdf if pdf.startswith("http") else "https://camaracordoba.com" + pdf
        # Return first PDF found
        if pdfs:
            url = pdfs[0]
            return url if url.startswith("http") else "https://camaracordoba.com" + url
    except:
        pass
    return None


def download_pdf(url):
    # If it's a WordPress page (not a PDF), extract the embedded PDF URL first
    if not url.lower().endswith(".pdf"):
        pdf_url = get_pdf_from_page(url)
        if pdf_url:
            url = pdf_url
        else:
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
        "max_tokens": 800,
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
    return json.loads(text)


def save_to_supabase(date_str, prices):
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
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/prices?on_conflict=lonja_id,session_date,product_key",
        json=rows, headers=headers, timeout=20)
    if not r.ok:
        print(f"    Supabase error {r.status_code}: {r.text[:200]}")
    r.raise_for_status()
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
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    }
    r = requests.delete(
        f"{SUPABASE_URL}/rest/v1/prices?lonja_id=eq.{LONJA_ID}",
        headers=headers, timeout=20)
    r.raise_for_status()
    print("  ✓ Datos anteriores de Córdoba borrados")


if __name__ == "__main__":
    import sys
    reset_mode = "--reset" in sys.argv

    print("=" * 60)
    print("Extracción histórica · Lonja de Córdoba")
    print("=" * 60)

    if "TU_CLAVE" in ANTHROPIC_API_KEY or "TU_SERVICE" in SUPABASE_SERVICE_KEY:
        print("\n⚠️  Configura tus claves")
        exit(1)

    if reset_mode:
        print("\n→ Modo RESET: borrando datos anteriores de Córdoba...")
        delete_all_cordoba()

    print("\n→ Consultando fechas ya procesadas...")
    existing = get_existing_dates()
    print(f"  Ya procesadas: {len(existing)} sesiones")

    print("\n→ Descargando índice de cotizaciones de Córdoba...")
    pdf_index = scrape_cordoba_urls()

    pending = [(d, pdf_index[d]) for d in sorted(pdf_index.keys()) if d not in existing]
    print(f"  Pendientes: {len(pending)} sesiones")

    if not pending:
        print("\n✓ Todo el histórico de Córdoba ya está cargado.")
        exit(0)

    ok, failed, not_found = 0, [], []

    for i, (date, url) in enumerate(pending):
        print(f"\n[{i+1}/{len(pending)}] {date}")
        print(f"  URL: {url}")

        pdf = download_pdf(url)
        if pdf is None:
            print(f"  ✗ PDF no descargable")
            not_found.append(date)
            continue
        print(f"  ✓ PDF descargado ({len(pdf)//1024} KB)")

        prices = None
        for attempt in range(3):
            try:
                prices = extract_with_claude(pdf)
                n = sum(1 for v in prices.values() if v is not None)
                print(f"  ✓ Extraídos {n} precios")
                break
            except Exception as e:
                msg = str(e)
                if "529" in msg or "overloaded" in msg.lower():
                    wait = 30 * (attempt + 1)
                    print(f"  ⚠ API saturada, esperando {wait}s...")
                    time.sleep(wait)
                else:
                    print(f"  ✗ Error extracción: {e}")
                    failed.append(date)
                    time.sleep(3)
                    break

        if prices is None:
            if date not in failed:
                failed.append(date)
            continue

        try:
            saved = save_to_supabase(date, prices)
            print(f"  ✓ Guardados {saved} registros en Supabase")
            ok += 1
        except Exception as e:
            print(f"  ✗ Error Supabase: {e}")
            failed.append(date)

        time.sleep(3)

    print("\n" + "=" * 60)
    print("RESUMEN")
    print("=" * 60)
    print(f"  ✓ Procesadas correctamente: {ok}")
    print(f"  ✗ PDFs no descargables:     {len(not_found)}")
    print(f"  ✗ Errores de extracción:    {len(failed)}")
    if failed:
        print(f"\nFallidas:")
        for d in failed: print(f"  {d}")
    print("\nListo.")
