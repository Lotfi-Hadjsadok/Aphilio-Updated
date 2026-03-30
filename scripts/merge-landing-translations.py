#!/usr/bin/env python3
"""Merge translated landing blocks from messages/landing/ into messages/<locale>.json."""

import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MESSAGES = os.path.join(ROOT, "messages")
LANDING_DIR = os.path.join(MESSAGES, "landing")


def main() -> None:
    for filename in os.listdir(LANDING_DIR):
        if not filename.endswith(".json"):
            continue
        locale = filename.replace(".json", "")
        landing_path = os.path.join(LANDING_DIR, filename)
        target_path = os.path.join(MESSAGES, f"{locale}.json")

        with open(landing_path, encoding="utf-8") as file_handle:
            landing = json.load(file_handle)

        with open(target_path, encoding="utf-8") as file_handle:
            data = json.load(file_handle)

        data["landing"] = landing

        with open(target_path, "w", encoding="utf-8") as file_handle:
            json.dump(data, file_handle, ensure_ascii=False, indent=2)
            file_handle.write("\n")

        print(f"Merged landing → {locale}.json")


if __name__ == "__main__":
    main()
