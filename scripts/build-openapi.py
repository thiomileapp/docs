#!/usr/bin/env python3
"""
MileApp OpenAPI Build Script

Mimics Laravel ResourceController compilation logic.
Merges modular JSON files into single OpenAPI specs.

Usage:
    python scripts/build-openapi.py           # Build both
    python scripts/build-openapi.py public    # Build public only
    python scripts/build-openapi.py internal  # Build internal only
"""

import json
import yaml
import sys
from pathlib import Path

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
API_SPECS = PROJECT_ROOT / "api-specs"
BASE_DIR = API_SPECS / "base"
PUBLIC_DIR = API_SPECS / "public"
INTERNAL_DIR = API_SPECS / "internal"
MODELS_DIR = API_SPECS / "Models"
OUTPUT_DIR = PROJECT_ROOT


def load_yaml(path):
    with open(path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f) or {}


def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        # strict=False allows control characters in strings (like newlines)
        return json.load(f, strict=False)


def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✓ Generated: {path}")


def get_submodule_name(file_path):
    """Extract submodule: '1_Task.json' -> 'Task.json'"""
    name = file_path.name
    parts = name.split('_', 1)
    return parts[1] if len(parts) > 1 and parts[0].isdigit() else name


def merge_spec(base, module):
    """Merge module into base (paths, definitions, components, webhooks)"""
    if 'paths' in module and module['paths']:
        base.setdefault('paths', {}).update(module['paths'])
    if 'definitions' in module and module['definitions']:
        base.setdefault('definitions', {}).update(module['definitions'])
    if 'components' in module and module.get('components', {}).get('schemas'):
        base.setdefault('components', {}).setdefault('schemas', {}).update(module['components']['schemas'])
    if 'x-webhooks' in module and module['x-webhooks']:
        base.setdefault('x-webhooks', {}).update(module['x-webhooks'])


def build_public():
    """Build public API: base + public modules"""
    print("\n📦 Building PUBLIC API...")

    # Load base
    result = load_yaml(BASE_DIR / "initial.yaml") if (BASE_DIR / "initial.yaml").exists() else {}
    # Ensure paths/definitions are dicts (not None)
    result['paths'] = result.get('paths') or {}
    result['definitions'] = result.get('definitions') or {}

    # Load params
    if (BASE_DIR / "params.yaml").exists():
        result['parameters'] = load_yaml(BASE_DIR / "params.yaml")

    # Merge public modules
    for module_dir in sorted(PUBLIC_DIR.iterdir()) if PUBLIC_DIR.exists() else []:
        if module_dir.is_dir():
            for json_file in sorted(module_dir.glob("*.json")):
                merge_spec(result, load_json(json_file))
                print(f"  + {module_dir.name}/{json_file.name}")

    # Merge Models
    for json_file in sorted(MODELS_DIR.glob("*.json")) if MODELS_DIR.exists() else []:
        merge_spec(result, load_json(json_file))
        print(f"  + Models/{json_file.name}")

    return result


def build_internal():
    """Build internal API: base + internal (override) + public (fill gaps)"""
    print("\n🔒 Building INTERNAL API...")

    # Load base
    base_file = BASE_DIR / "initial_internal.yaml"
    if not base_file.exists():
        base_file = BASE_DIR / "initial.yaml"
    result = load_yaml(base_file) if base_file.exists() else {}
    # Ensure paths/definitions are dicts (not None)
    result['paths'] = result.get('paths') or {}
    result['definitions'] = result.get('definitions') or {}

    # Load params
    if (BASE_DIR / "params.yaml").exists():
        result['parameters'] = load_yaml(BASE_DIR / "params.yaml")

    # Track registered submodules (internal takes precedence)
    registered = {}

    # 1. Process INTERNAL first
    for module_dir in sorted(INTERNAL_DIR.iterdir()) if INTERNAL_DIR.exists() else []:
        if module_dir.is_dir():
            registered.setdefault(module_dir.name, {})
            for json_file in sorted(module_dir.glob("*.json")):
                submodule = get_submodule_name(json_file)
                merge_spec(result, load_json(json_file))
                registered[module_dir.name][submodule] = True
                print(f"  + (internal) {module_dir.name}/{json_file.name}")

    # 2. Process PUBLIC (skip if internal exists)
    for module_dir in sorted(PUBLIC_DIR.iterdir()) if PUBLIC_DIR.exists() else []:
        if module_dir.is_dir():
            for json_file in sorted(module_dir.glob("*.json")):
                submodule = get_submodule_name(json_file)
                if registered.get(module_dir.name, {}).get(submodule):
                    print(f"  - (skip) {module_dir.name}/{json_file.name}")
                    continue
                merge_spec(result, load_json(json_file))
                print(f"  + (public) {module_dir.name}/{json_file.name}")

    # Merge Models
    for json_file in sorted(MODELS_DIR.glob("*.json")) if MODELS_DIR.exists() else []:
        merge_spec(result, load_json(json_file))
        print(f"  + Models/{json_file.name}")

    return result


def main():
    print("=" * 50)
    print("MileApp OpenAPI Build")
    print("=" * 50)

    target = sys.argv[1] if len(sys.argv) > 1 else "all"

    if target in ["all", "public"]:
        spec = build_public()
        save_json(OUTPUT_DIR / "openapi-public.json", spec)
        print(f"  Paths: {len(spec.get('paths', {}))}")

    if target in ["all", "internal"]:
        spec = build_internal()
        save_json(OUTPUT_DIR / "openapi-internal.json", spec)
        print(f"  Paths: {len(spec.get('paths', {}))}")

    print("\n✅ Build complete!")


if __name__ == "__main__":
    main()
