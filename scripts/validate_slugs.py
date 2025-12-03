#!/usr/bin/env python3
"""
Slug Uniqueness Validator
Validates that all slugs in the enriched cocktail CSV are unique and URL-safe.
"""

import csv
import re
from pathlib import Path
from collections import Counter

def is_url_safe(slug):
    """Check if slug is URL-safe (lowercase, alphanumeric, hyphens only)."""
    return bool(re.match(r'^[a-z0-9-]+$', slug))

def validate_slugs(csv_file):
    """Validate all slugs in the CSV file."""
    print("🔍 Slug Uniqueness Validator")
    print("=" * 60)
    print(f"📄 Validating: {csv_file}\n")
    
    slugs = []
    errors = []
    warnings = []
    
    # Read CSV
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader, start=2):  # Start at 2 (header is line 1)
            slug = row.get('slug', '').strip()
            name = row.get('name', '').strip()
            
            if not slug:
                errors.append(f"Line {i}: Empty slug for cocktail '{name}'")
                continue
            
            # Check if lowercase
            if slug != slug.lower():
                errors.append(f"Line {i}: Slug '{slug}' contains uppercase letters")
            
            # Check if URL-safe
            if not is_url_safe(slug):
                errors.append(f"Line {i}: Slug '{slug}' is not URL-safe (use only lowercase letters, numbers, and hyphens)")
            
            # Check for consecutive hyphens
            if '--' in slug:
                warnings.append(f"Line {i}: Slug '{slug}' contains consecutive hyphens")
            
            # Check for leading/trailing hyphens
            if slug.startswith('-') or slug.endswith('-'):
                errors.append(f"Line {i}: Slug '{slug}' has leading or trailing hyphens")
            
            slugs.append(slug)
    
    # Check for duplicates
    slug_counts = Counter(slugs)
    duplicates = {slug: count for slug, count in slug_counts.items() if count > 1}
    
    # Report results
    print(f"📊 Total slugs checked: {len(slugs)}")
    print(f"🔤 Unique slugs: {len(slug_counts)}")
    
    if errors:
        print(f"\n❌ Found {len(errors)} error(s):")
        for error in errors:
            print(f"   {error}")
    
    if duplicates:
        print(f"\n❌ Duplicate slugs found:")
        for slug, count in duplicates.items():
            print(f"   '{slug}' appears {count} times")
    
    if warnings:
        print(f"\n⚠️  Found {len(warnings)} warning(s):")
        for warning in warnings:
            print(f"   {warning}")
    
    if not errors and not duplicates:
        print(f"\n✅ All slugs are valid and unique!")
        print(f"✅ All slugs are lowercase")
        print(f"✅ All slugs are URL-safe")
        return True
    else:
        print(f"\n❌ Validation failed. Please fix the errors above.")
        return False

def main():
    csv_file = Path('/Users/ethan/Downloads/mixwise-second-main/data/cocktails_enriched_for_supabase.csv')
    
    if not csv_file.exists():
        print(f"❌ Error: File not found: {csv_file}")
        return False
    
    return validate_slugs(csv_file)

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)

