"""
extract_historico.py
────────────────────
Extrae precios de la Lonja de Sevilla y los guarda en Supabase.
- Histórico: URLs hardcodeadas (ya conocidas, no requiere scraping)
- Sesiones nuevas: URL construida directamente desde la fecha

Uso:
    python extract_historico.py          # procesa solo sesiones pendientes
    python extract_historico.py --reset  # borra todo y recarga desde cero

Variables de entorno:
    ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
"""

import os, re, time, base64, json, requests
from datetime import datetime, date, timedelta

ANTHROPIC_API_KEY    = os.environ.get("ANTHROPIC_API_KEY",    "TU_CLAVE_AQUI")
SUPABASE_URL         = os.environ.get("SUPABASE_URL",         "https://vriqawhaickizakkaicc.supabase.co")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "TU_SERVICE_KEY_AQUI")
LONJA_ID             = "sevilla"

MESES = {
    "01":"enero","02":"febrero","03":"marzo","04":"abril",
    "05":"mayo","06":"junio","07":"julio","08":"agosto",
    "09":"septiembre","10":"octubre","11":"noviembre","12":"diciembre"
}

# ── URLs hardcodeadas para el histórico ───────────────────────────────────────
# Mapeado completo de fecha → URL real (obtenido por scraping previo)
HISTORICAL_URLS = {
    "2015-03-03":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_3_de_marzo_2015.pdf",
    "2015-03-24":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_24_de_marzo_2015.pdf",
    "2015-04-14":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_14_de_abril_2015.pdf",
    "2015-05-05":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_5_de_mayo_2015.pdf",
    "2015-05-26":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_26_de_mayo_2015.pdf",
    "2015-06-02":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_2_de_junio_2015.pdf",
    "2015-06-09":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_9_de_junio_2015.pdf",
    "2015-06-16":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_16_de_junio_2015.pdf",
    "2015-06-23":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_23_de_junio_2015.pdf",
    "2015-06-30":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_30_de_junio_2015.pdf",
    "2015-07-07":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_7_de_julio_2015.pdf",
    "2015-07-14":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_14_de_julio_2015.pdf",
    "2015-07-21":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_21_de_julio_2015.pdf",
    "2015-07-28":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_28_de_julio_2015.pdf",
    "2015-09-15":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_15_de_septiembre_2015.pdf",
    "2015-09-29":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_29_de_septiembre_2015.pdf",
    "2015-10-13":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_13_de_octubre_2015.pdf",
    "2015-10-27":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_27_de_octubre_2015.pdf",
    "2015-11-10":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_10_de_noviembre_2015.pdf",
    "2015-11-24":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_24_de_noviembre_2015.pdf",
    "2015-12-09":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_9_de_diciembre_2015.pdf",
    "2015-12-22":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_22_de_diciembre_2015.pdf",
    "2016-01-12":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_12_de_enero_2016.pdf",
    "2016-01-26":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_26_de_enero_2016.pdf",
    "2016-02-09":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_9_de_febrero_2016.pdf",
    "2016-02-23":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_23_de_febrero_2016.pdf",
    "2016-03-08":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_8_de_marzo_2016.pdf",
    "2016-03-29":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_29_de_marzo_2016.pdf",
    "2016-04-19":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_19_de_abril_2016.pdf",
    "2016-05-03":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_3_de_mayo_2016.pdf",
    "2016-05-17":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_17_de_mayo_2016.pdf",
    "2016-05-31":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_31_de_mayo_2016.pdf",
    "2016-06-07":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_7_de_junio_2016.pdf",
    "2016-06-14":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_14_de_junio_2016.pdf",
    "2016-06-28":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_28_de_junio_2016.pdf",
    "2016-07-05":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_5_de_julio_2016.pdf",
    "2016-07-19":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_19_de_julio_2016.pdf",
    "2016-08-02":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_2_de_agosto_2016.pdf",
    "2016-08-23":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_23_de_agosto_2016.pdf",
    "2016-09-06":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_6_de_septiembre_2016.pdf",
    "2016-09-20":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_20_de_septiembre_2016.pdf",
    "2016-10-05":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_5_de_octubre_2016.pdf",
    "2016-10-18":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_18_de_octubre_2016.pdf",
    "2016-10-25":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_25_de_octubre_2016.pdf",
    "2016-11-08":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_8_de_noviembre_2016.pdf",
    "2016-11-22":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_22_de_noviembre_2016.pdf",
    "2016-11-29":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_29_de_noviembre_2016.pdf",
    "2016-12-13":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_13_de_diciembre_2016.pdf",
    "2017-01-10":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_10_de_enero_2017.pdf",
    "2017-01-17":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_17_de_enero_2017.pdf",
    "2017-01-31":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_31_de_enero_2017.pdf",
    "2017-02-14":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_14_de_febrero_2017.pdf",
    "2017-03-07":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_7_de_marzo_2017.pdf",
    "2017-03-21":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_21_de_marzo_2017.pdf",
    "2017-04-04":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_4_de_abril_2017.pdf",
    "2017-04-25":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_25_de_abril_2017.pdf",
    "2017-05-23":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_23_de_mayo_2017.pdf",
    "2017-05-31":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_31_de_mayo_2017.pdf",
    "2017-06-06":"https://lonjadesevilla.com/wp-content/uploads/2021/04/COMISION_DE_PRECIOS_DE_6_DE_JUNIO_2017.pdf",
    "2017-06-13":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_13_de_junio_de_2017.pdf",
    "2017-06-20":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_20_de_junio_de_2017.pdf",
    "2017-07-04":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_4_de_julio_2017.pdf",
    "2017-07-18":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_18_de_julio_2017.pdf",
    "2017-07-25":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_-25_de_julio_2017.pdf",
    "2017-08-01":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_01_de_agosto_2017.pdf",
    "2017-08-22":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_22_de_agosto_2017.pdf",
    "2017-09-05":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_5_de_septiembre_2017.pdf",
    "2017-09-19":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_19_de_septiembre_2017.pdf",
    "2017-10-03":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_3_de_octubre_2017.pdf",
    "2017-10-17":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_17_de_octubre_2017.pdf",
    "2017-10-31":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de-31_de_octubre_2017.pdf",
    "2017-11-14":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_14_de_noviembre_2017.pdf",
    "2017-11-28":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_28_de_noviembre_2017.pdf",
    "2017-12-19":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_19_de_diciembre_2017.pdf",
    "2018-01-09":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_9_de_enero_2018.pdf",
    "2018-01-23":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_23_de_enero_2018.pdf",
    "2018-02-06":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_6_de_febrero_2018.pdf",
    "2018-02-20":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_20_de_febrero_2018.pdf",
    "2018-03-06":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_6_de_marzo_2018.pdf",
    "2018-03-20":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_20_de_marzo_2018.pdf",
    "2018-04-03":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_3_de_abril_2018.pdf",
    "2018-04-25":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_25_de_abril_2018.pdf",
    "2018-05-08":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_8_de_mayo_2018.pdf",
    "2018-05-22":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_22_de_mayo_2018.pdf",
    "2018-06-05":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_5_de_junio_2018.pdf",
    "2018-06-12":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_de_12_de_junio_2018.pdf",
    "2018-06-19":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_19_de_junio_2018.pdf",
    "2018-06-26":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_26_de_junio_2018.pdf",
    "2018-10-02":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_2_de_octubre_2018.pdf",
    "2018-10-16":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_16_de_octubre_2018.pdf",
    "2018-10-30":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_30_de_octubre_de_2018.pdf",
    "2018-11-13":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_13_de_noviembre_2018.pdf",
    "2018-11-27":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_27_de_noviembre_2018.pdf",
    "2018-12-11":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_11_de_diciembre_2018.pdf",
    "2019-01-29":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_29_de_enero_2019.pdf",
    "2019-02-12":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_12_de_febrero_2019.pdf",
    "2019-02-26":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_26_de_febrero_2019.pdf",
    "2019-03-12":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_12_de_marzo_2019.pdf",
    "2019-03-26":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_26_de_marzo_2019.pdf",
    "2019-04-09":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_9_de_abril_2019.pdf",
    "2019-04-23":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_23_de_abril_2019.pdf",
    "2019-05-14":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_14_de_mayo_2019.pdf",
    "2019-05-21":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_21_de_mayo_2019.pdf",
    "2019-06-04":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_4_de_junio_2019.pdf",
    "2019-06-11":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_11_de_junio_2019.pdf",
    "2019-06-18":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_18_de_junio_2019.pdf",
    "2019-06-25":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_25_de_junio_2019.pdf",
    "2019-07-09":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_9_de_julio_2019.pdf",
    "2019-07-16":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_16_de_julio_2019.pdf",
    "2019-07-23":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_23_de_julio_2019.pdf",
    "2019-08-13":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_13_de_agosto_2019.pdf",
    "2019-08-27":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_27_de_agosto_2019.pdf",
    "2019-09-10":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_10_de_septiembre_2019.pdf",
    "2019-09-24":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_24_de_septiembre_2019.pdf",
    "2019-10-08":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_8_de_octubre_2019.pdf",
    "2019-10-22":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_22_de_octubre_2019.pdf",
    "2019-11-05":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_5_de_noviembre_2019.pdf",
    "2019-11-19":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_19_de_noviembre_2019.pdf",
    "2019-12-03":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_3_de_diciembre_2019.pdf",
    "2019-12-17":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_17_de_diciembre_2019.pdf",
    "2020-01-07":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_7_de_enero_2020.pdf",
    "2020-02-04":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_4_de_febrero_2020.pdf",
    "2020-02-18":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_18_de_febrero_2020.pdf",
    "2020-03-24":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_24_de_marzo_2020.pdf",
    "2020-04-07":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_7_de_abril_2020.pdf",
    "2020-04-21":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_21_de_abril_2020.pdf",
    "2020-05-05":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_5_de_mayo_2020.pdf",
    "2020-05-19":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_19_de_mayo_2020.pdf",
    "2020-05-26":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_26_de_mayo_2020.pdf",
    "2020-06-02":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_2_de_junio_2020.pdf",
    "2020-06-09":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_9_de_junio_2020.pdf",
    "2020-06-16":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_16_de_junio_2020.pdf",
    "2020-06-23":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_23_de_junio_2020.pdf",
    "2020-06-30":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_30_de_junio_2020.pdf",
    "2020-07-07":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_7_de_julio_2020.pdf",
    "2020-07-14":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_14_de_julio_2020.pdf",
    "2020-07-21":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_21_de_julio_2020.pdf",
    "2020-07-28":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_28_de_julio_2020.pdf",
    "2020-08-11":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_11_de_agosto_2020.pdf",
    "2020-08-25":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_25_de_agosto_2020.pdf",
    "2020-09-08":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_8_de_septiembre_2020.pdf",
    "2020-09-22":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_22_de_septiembre_2020.pdf",
    "2020-10-06":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_6_de_octubre_2020.pdf",
    "2020-10-20":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_20_de_octubre_2020.pdf",
    "2020-11-03":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_3_de_noviembre_2020.pdf",
    "2020-12-01":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_1_de_diciembre_2020.pdf",
    "2020-12-15":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_15_de_diciembre_2020.pdf",
    "2021-01-12":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_precios_12_de_enero_2021.pdf",
    "2021-01-26":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_26_de_enero_2021.pdf",
    "2021-02-23":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_23_de_febrero_2021.pdf",
    "2021-03-09":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_9_de_marzo_2021.pdf",
    "2021-03-23":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_23_de_marzo_2021.pdf",
    "2021-04-06":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_6_de_abril_2021.pdf",
    "2021-04-20":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_20_de_abril_2021.pdf",
    "2021-05-04":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_4_de_mayo_2021.pdf",
    "2021-05-18":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_18_de_mayo_2021.pdf",
    "2021-05-25":"https://lonjadesevilla.com/wp-content/uploads/2021/04/Comision_de_precios_de_25_de_mayo_2021.pdf",
    "2021-06-01":"https://lonjadesevilla.com/wp-content/uploads/2021/06/Comision_de_precios_de_1_de_junio_2021.pdf",
    "2021-06-08":"https://lonjadesevilla.com/wp-content/uploads/2021/06/Comision_de_precios_de_8_de_junio_2021.pdf",
    "2021-06-29":"https://lonjadesevilla.com/wp-content/uploads/2021/06/Comision_de_precios_de_29_de_junio_2021.pdf",
    "2021-07-06":"https://lonjadesevilla.com/wp-content/uploads/2021/07/Comision_de_precios_de_6_de_julio_2021.pdf",
    "2021-07-13":"https://lonjadesevilla.com/wp-content/uploads/2021/07/Comision_de_precios_de_13_de_julio_2021.pdf",
    "2021-07-20":"https://lonjadesevilla.com/wp-content/uploads/2021/07/Comision_de_precios_de_20_de_julio_2021.pdf",
    "2021-07-27":"https://lonjadesevilla.com/wp-content/uploads/2021/07/Comision_de_precios_de_27_de_julio_2021.pdf",
    "2021-08-10":"https://lonjadesevilla.com/wp-content/uploads/2021/08/Comision_de_precios_de_10_de_agosto_2021.pdf",
    "2021-08-17":"https://lonjadesevilla.com/wp-content/uploads/2021/08/Comision_de_precios_de_17_de_agosto_2021.pdf",
    "2021-08-24":"https://lonjadesevilla.com/wp-content/uploads/2021/08/Comision_de_precios_de_24_de_agosto_2021.pdf",
    "2021-08-31":"https://lonjadesevilla.com/wp-content/uploads/2021/08/Comision_de_precios_de_31_de_agosto_2021.pdf",
    "2021-09-07":"https://lonjadesevilla.com/wp-content/uploads/2021/09/Comision_de_precios_de_7_de_septiembre_2021.pdf",
    "2021-09-14":"https://lonjadesevilla.com/wp-content/uploads/2021/09/Comision_de_precios_de_14_de_septiembre_2021.pdf",
    "2021-09-21":"https://lonjadesevilla.com/wp-content/uploads/2021/09/Comision_de_precios_de_21_de_septiembre_2021.pdf",
    "2021-10-05":"https://lonjadesevilla.com/wp-content/uploads/2021/10/Comision_precios_5_de_octubre_2021.pdf",
    "2021-10-19":"https://lonjadesevilla.com/wp-content/uploads/2022/01/Comision_de_precios_de_19_de_octubre_2021.pdf",
    "2021-11-02":"https://lonjadesevilla.com/wp-content/uploads/2022/01/Comision_de_precios_de_2_de_noviembre_2021.pdf",
    "2021-11-16":"https://lonjadesevilla.com/wp-content/uploads/2022/01/Comision_de_precios_de_16_de_noviembre_2021.pdf",
    "2021-11-30":"https://lonjadesevilla.com/wp-content/uploads/2022/01/Comision_de_precios_de_30_de_noviembre_2021.pdf",
    "2021-12-14":"https://lonjadesevilla.com/wp-content/uploads/2022/01/Comision_de_precios_de_14_de_diciembre_2021.pdf",
    "2022-01-11":"https://lonjadesevilla.com/wp-content/uploads/2022/01/Comision_de_precios_de_11_de_enero_2022.pdf",
    "2022-01-25":"https://lonjadesevilla.com/wp-content/uploads/2022/01/Comision_de_precios_de_25_de_enero_2022.pdf",
    "2022-02-08":"https://lonjadesevilla.com/wp-content/uploads/2022/02/Comision_de_precios_de_8_de_febrero_2022.pdf",
    "2022-02-22":"https://lonjadesevilla.com/wp-content/uploads/2022/02/Comision_de_precios_de_22_de_febrero_2022.pdf",
}

PROMPT = """Extrae los precios y volumen de operaciones de este PDF de la Lonja de Sevilla.
Devuelve SOLO JSON válido, sin markdown, sin texto adicional.
Usa el valor numérico de la columna COTIZACION ACTUAL (€/Tonelada).
Si un producto pone S/O, S/C, o no aparece, usa null para precio y volumen.

Para el volumen de operaciones usa la columna "Volumen de Operaciones":
- "A" o "ALTO" → "A"
- "M" o "MEDIO" → "M"
- "B" o "BAJO" → "B"
- vacío, S/O, o sin operaciones → null

Mapeo exacto:
- TRIGO BLANDO · Grupo 1 → tbn_g1
- TRIGO BLANDO · Grupo 2 → tbn_g2
- TRIGO BLANDO · Grupo 3 → tbn_g3
- TRIGO BLANDO · Grupo 4 → tbn_g4
- TRIGO BLANDO · Grupo 5: PIENSO → tbn_pienso
- Pienso IMPORTACION Origen Puerto → ti_pienso
- TRIGO DURO · Grupo 1 → tdn_g1
- TRIGO DURO · Grupo 2 → tdn_g2
- TRIGO DURO · Grupo 3 → tdn_g3
- TRIGO DURO · Grupo 4 El resto → tdn_g4
- TRITICALE · Nacional → trit_nac
- TRITICALE · IMPORTACION → trit_imp
- AVENA · Nacional → avena_nac
- AVENA · IMPORTACION → avena_imp
- CEBADA · Igual y más de 64 → cebada_nac
- CEBADA · IMPORTACION → cebada_imp
- MAIZ · Nacional → maiz_nac
- MAIZ · IMPORTACION → maiz_imp
- HABAS · Nacional → habas_nac
- HABAS · IMPORTACION → habas_imp
- GUISANTES · Nacional → guisan_nac
- GUISANTES · IMPORTACION → guisan_imp
- GIRASOL · Alto oleico >=80% → girasol_alto
- GIRASOL · Convencional → girasol_conv
- COLZA · 9-2-42 → colza

{"prices":{"tbn_g1":null,"tbn_g2":null,"tbn_g3":null,"tbn_g4":null,"tbn_pienso":null,"tdn_g1":null,"tdn_g2":null,"tdn_g3":null,"tdn_g4":null,"ti_pienso":null,"cebada_nac":null,"cebada_imp":null,"trit_nac":null,"trit_imp":null,"avena_nac":null,"avena_imp":null,"maiz_nac":null,"maiz_imp":null,"habas_nac":null,"habas_imp":null,"guisan_nac":null,"guisan_imp":null,"girasol_alto":null,"girasol_conv":null,"colza":null},"volumes":{"tbn_g1":null,"tbn_g2":null,"tbn_g3":null,"tbn_g4":null,"tbn_pienso":null,"tdn_g1":null,"tdn_g2":null,"tdn_g3":null,"tdn_g4":null,"ti_pienso":null,"cebada_nac":null,"cebada_imp":null,"trit_nac":null,"trit_imp":null,"avena_nac":null,"avena_imp":null,"maiz_nac":null,"maiz_imp":null,"habas_nac":null,"habas_imp":null,"guisan_nac":null,"guisan_imp":null,"girasol_alto":null,"girasol_conv":null,"colza":null}}"""


def build_url(date_str):
    """Construye URL para sesiones desde 2022-03 en adelante (patrón estable)"""
    y, m, d = date_str.split("-")
    mes = MESES[m]
    d_nopad = str(int(d))
    base = f"https://lonjadesevilla.com/wp-content/uploads/{y}/{m}/"
    return [
        base + f"Comision_de_precios_de_{d_nopad}_de_{mes}_{y}.pdf",
        base + f"Comision_de_precios_de_{d}_de_{mes}_{y}.pdf",
    ]


def get_url(date_str):
    """Devuelve URL(s) para una fecha — hardcoded para histórico, construida para nuevas"""
    if date_str in HISTORICAL_URLS:
        return [HISTORICAL_URLS[date_str]]
    return build_url(date_str)


def download_pdf(urls):
    for url in urls:
        try:
            r = requests.get(url, timeout=30,
                headers={"User-Agent": "Mozilla/5.0"})
            ct = r.headers.get("content-type", "")
            if r.status_code == 200 and ("pdf" in ct or len(r.content) > 5000):
                return r.content, url
        except Exception as e:
            pass
    return None, None


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
            rows.append({
                "lonja_id": LONJA_ID,
                "session_date": date_str,
                "product_key": k,
                "price": v,
                "volume": vol if vol in ("A", "M", "B") else None
            })
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


def delete_all():
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    }
    r = requests.delete(
        f"{SUPABASE_URL}/rest/v1/prices?lonja_id=eq.{LONJA_ID}",
        headers=headers, timeout=20)
    r.raise_for_status()
    print("  ✓ Datos anteriores borrados")


def get_recent_sessions():
    """
    Para el GitHub Action: busca sesiones nuevas en los últimos 14 días.
    Genera fechas de martes recientes y prueba si existe el PDF.
    """
    today = date.today()
    candidates = []
    d = today
    for _ in range(20):  # buscar en los últimos ~20 días
        if d.weekday() == 1:  # martes
            candidates.append(d.strftime("%Y-%m-%d"))
        d -= timedelta(days=1)
    return candidates


if __name__ == "__main__":
    import sys
    reset_mode = "--reset" in sys.argv
    recent_mode = "--recent" in sys.argv  # para GitHub Action

    print("=" * 60)
    print("Extracción histórica · Lonja de Sevilla")
    print("=" * 60)

    if "TU_CLAVE" in ANTHROPIC_API_KEY or "TU_SERVICE" in SUPABASE_SERVICE_KEY:
        print("\n⚠️  Configura tus claves")
        exit(1)

    if reset_mode:
        print("\n→ Modo RESET...")
        delete_all()

    print("\n→ Consultando fechas ya procesadas en Supabase...")
    existing = get_existing_dates()
    print(f"  Ya procesadas: {len(existing)} sesiones")

    if recent_mode:
        # GitHub Action: solo busca sesiones recientes (últimas 3 semanas)
        print("\n→ Modo reciente: buscando sesiones nuevas...")
        candidates = get_recent_sessions()
        pending = [(d, get_url(d)) for d in candidates if d not in existing]
        print(f"  Candidatas: {len(pending)} fechas de martes recientes")
    else:
        # Modo completo: todas las fechas conocidas
        all_dates = sorted(set(list(HISTORICAL_URLS.keys())))
        pending = [(d, get_url(d)) for d in all_dates if d not in existing]
        print(f"  Pendientes históricas: {len(pending)} sesiones")

    if not pending:
        print("\n✓ Todo al día.")
        exit(0)

    ok, failed, not_found = 0, [], []

    for i, (session_date, urls) in enumerate(pending):
        print(f"\n[{i+1}/{len(pending)}] {session_date}")
        pdf, used_url = download_pdf(urls)
        if pdf is None:
            print(f"  ✗ PDF no encontrado")
            not_found.append(session_date)
            continue
        print(f"  ✓ PDF descargado ({len(pdf)//1024} KB) — {used_url}")

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
