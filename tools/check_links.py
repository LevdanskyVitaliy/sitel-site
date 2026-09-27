#!/usr/bin/env python3
"""Аудит статического сайта Sitel: внутренние ссылки и баланс тегов.

Запуск:
    python3 tools/check_links.py              # корень = родительская папка скрипта
    python3 tools/check_links.py /путь/к/сайту

Что проверяет:
    1. Все локальные href/src в *.html и platforms/*.html разрешаются в существующий файл.
    2. Нет root-absolute путей (начинаются с "/") — они ломают просмотр по file:// и деплой в подкаталог.
    3. Баланс парных тегов <section> и <div> (быстрый признак поломки вёрстки при правках).

Внешние ссылки (http/https/mailto/tel/data/javascript/) и якоря "#" пропускаются.
"""
import glob
import os
import re
import sys

ROOT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

files = sorted(glob.glob(os.path.join(ROOT, "*.html"))) + sorted(glob.glob(os.path.join(ROOT, "platforms", "*.html")))

href_re = re.compile(r'(?:href|src)\s*=\s*"([^"]+)"')
SKIP_PREFIXES = ("http://", "https://", "mailto:", "tel:", "#", "data:", "javascript:")

problems = []
for f in files:
    html = open(f, encoding="utf-8").read()
    for ref in href_re.findall(html):
        if ref.startswith(SKIP_PREFIXES):
            continue
        if ref.startswith("/"):
            problems.append((f, ref, "root-absolute"))
            continue
        target = os.path.normpath(os.path.join(os.path.dirname(f), ref.split("#")[0].split("?")[0]))
        if not os.path.exists(target):
            problems.append((f, ref, "missing"))

print("ROOT:", ROOT)
print("PAGES:", len(files))
if not problems:
    print("All local links OK")
for f, ref, kind in problems:
    print(f"{kind}\t{os.path.relpath(f, ROOT)}\t{ref}")

for f in files:
    html = open(f, encoding="utf-8").read()
    opens, closes = len(re.findall(r"<section\b", html)), len(re.findall(r"</section>", html))
    dopens, dcloses = len(re.findall(r"<div\b", html)), len(re.findall(r"</div>", html))
    if opens != closes or dopens != dcloses:
        print(f"TAGMISMATCH\t{os.path.relpath(f, ROOT)}\tsection {opens}/{closes}\tdiv {dopens}/{dcloses}")
print("check done")
