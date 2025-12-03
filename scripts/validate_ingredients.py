#!/usr/bin/env python3
"""
Ingredient Format Validator
Validates ingredient formatting in the enriched cocktail CSV.
Checks for proper pipe-separation and ingredient format.
"""

import csv
import re
from pathlib import Path

def validate_ingredient_format(ingredient):
    """
    Validate that an ingredient matches expected format.
    Expected: "<amount> <ingredient>" or just "<ingredient>"
    Examples: "2 oz gin", "Dash bitters", "Salt for rim"
    """
    ingredient = ingredient.strip()
    
    if not ingredient:
        return False, "Empty ingredient"
    
    # Check for common error patterns
    if '???' in ingredient:
        return False, "Contains '???'"
    
    if ingredient == 'null' or ingredient == 'None':
        return False, "Invalid null value"
    
    # Valid patterns:
    # - Numeric amount with unit: "2 oz gin", "0.75 oz lime juice"
    # - Word amount: "Dash bitters", "Splash soda"
    # - Just ingredient (for garnishes): "Lemon twist", "Salt for rim"
    
    # Basic sanity checks
    if len(ingredient) < 2:
        return False, "Too short"
    
    if ingredient.count('|') > 0:
        return False, "Contains pipe character (should be split)"
    
    # Check if it looks reasonable (has letters)
    if not re.search(r'[a-zA-Z]', ingredient):
        return False, "No ingredient name found"
    
    return True, None

def validate_ingredients(csv_file):
    """Validate all ingredient lists in the CSV file."""
    print("🍹 Ingredient Format Validator")
    print("=" * 60)
    print(f"📄 Validating: {csv_file}\n")
    
    errors = []
    warnings = []
    total_rows = 0
    total_ingredients = 0
    
    # Read CSV
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader, start=2):  # Start at 2 (header is line 1)
            total_rows += 1
            name = row.get('name', '').strip()
            ingredients_str = row.get('ingredients', '').strip()
            
            if not ingredients_str:
                errors.append(f"Line {i} ({name}): No ingredients listed")
                continue
            
            # Split on pipe
            ingredients = [ing.strip() for ing in ingredients_str.split('|')]
            total_ingredients += len(ingredients)
            
            # Validate each ingredient
            for j, ingredient in enumerate(ingredients, start=1):
                is_valid, error_msg = validate_ingredient_format(ingredient)
                
                if not is_valid:
                    errors.append(f"Line {i} ({name}), ingredient #{j}: {error_msg} - '{ingredient}'")
            
            # Check for suspiciously short ingredient lists
            if len(ingredients) < 2:
                warnings.append(f"Line {i} ({name}): Only {len(ingredients)} ingredient(s) listed")
            
            # Check for suspiciously long ingredient lists
            if len(ingredients) > 15:
                warnings.append(f"Line {i} ({name}): {len(ingredients)} ingredients listed (very complex cocktail)")
    
    # Report results
    print(f"📊 Total cocktails checked: {total_rows}")
    print(f"📊 Total ingredients validated: {total_ingredients}")
    print(f"📊 Average ingredients per cocktail: {total_ingredients / total_rows:.1f}")
    
    if errors:
        print(f"\n❌ Found {len(errors)} error(s):")
        for error in errors[:30]:  # Limit to first 30 errors
            print(f"   {error}")
        if len(errors) > 30:
            print(f"   ... and {len(errors) - 30} more errors")
    
    if warnings:
        print(f"\n⚠️  Found {len(warnings)} warning(s):")
        for warning in warnings[:20]:  # Limit to first 20 warnings
            print(f"   {warning}")
        if len(warnings) > 20:
            print(f"   ... and {len(warnings) - 20} more warnings")
    
    if not errors:
        print(f"\n✅ All ingredients are properly formatted!")
        print(f"✅ All ingredients use pipe separation")
        print(f"✅ No null or invalid values found")
        return True
    else:
        print(f"\n❌ Validation failed. Please fix the errors above.")
        return False

def main():
    csv_file = Path('/Users/ethan/Downloads/mixwise-second-main/data/cocktails_enriched_for_supabase.csv')
    
    if not csv_file.exists():
        print(f"❌ Error: File not found: {csv_file}")
        return False
    
    return validate_ingredients(csv_file)

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)

