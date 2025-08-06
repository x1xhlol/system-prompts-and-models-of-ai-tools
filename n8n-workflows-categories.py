import json
import os
from pathlib import Path

def load_def_categories():
    """Load the definition categories from def_categories.json"""
    def_categories_path = Path("context/def_categories.json")
    with open(def_categories_path, 'r', encoding='utf-8') as f:
        categories_data = json.load(f)
    
    # Create a mapping from integration name (lowercase) to category
    integration_to_category = {}
    for item in categories_data:
        integration = item['integration'].lower()
        category = item['category']
        integration_to_category[integration] = category
    
    return integration_to_category

def extract_tokens_from_filename(filename):
    """Extract tokens from filename by splitting on '_' and removing '.json'"""
    # Remove .json extension
    name_without_ext = filename.replace('.json', '')
    
    # Split by underscore
    tokens = name_without_ext.split('_')
    
    # Convert to lowercase for matching
    tokens = [token.lower() for token in tokens if token]
    
    return tokens

def find_matching_category(tokens, integration_to_category):
    """Find the first matching category for the given tokens"""
    for token in tokens:
        if token in integration_to_category:
            return integration_to_category[token]
    
    # Try partial matches for common variations
    for token in tokens:
        for integration in integration_to_category:
            if token in integration or integration in token:
                return integration_to_category[integration]
    
    return ""

def main():
    # Load definition categories
    integration_to_category = load_def_categories()
    
    # Get all JSON files from workflows directory
    workflows_dir = Path("workflows")
    json_files = list(workflows_dir.glob("*.json"))
    
    # Process each file
    search_categories = []
    
    for json_file in json_files:
        filename = json_file.name
        tokens = extract_tokens_from_filename(filename)
        category = find_matching_category(tokens, integration_to_category)
        
        search_categories.append({
            "filename": filename,
            "category": category
        })
    
    # Sort by filename for consistency
    search_categories.sort(key=lambda x: x['filename'])
    
    # Write to search_categories.json
    output_path = Path("context/search_categories.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(search_categories, f, indent=2, ensure_ascii=False)
    
    print(f"Generated search_categories.json with {len(search_categories)} entries")
    
    # Generate unique categories list for API
    unique_categories = set()
    for item in search_categories:
        if item['category']:
            unique_categories.add(item['category'])
    
    # Always include 'Uncategorized' for workflows without categories
    unique_categories.add('Uncategorized')
    
    # Sort categories alphabetically
    categories_list = sorted(list(unique_categories))
    
    # Write unique categories to a separate file for API consumption
    categories_output_path = Path("context/unique_categories.json")
    with open(categories_output_path, 'w', encoding='utf-8') as f:
        json.dump(categories_list, f, indent=2, ensure_ascii=False)
    
    print(f"Generated unique_categories.json with {len(categories_list)} categories")
    
    # Print some statistics
    categorized = sum(1 for item in search_categories if item['category'])
    uncategorized = len(search_categories) - categorized
    print(f"Categorized: {categorized}, Uncategorized: {uncategorized}")
    
    # Print detailed category statistics
    print("\n" + "="*50)
    print("CATEGORY DISTRIBUTION (Top 20)")
    print("="*50)
    
    # Count categories
    category_counts = {}
    for item in search_categories:
        category = item['category'] if item['category'] else "Uncategorized"
        category_counts[category] = category_counts.get(category, 0) + 1
    
    # Sort by count (descending)
    sorted_categories = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)
    
    # Display top 20
    for i, (category, count) in enumerate(sorted_categories[:20], 1):
        print(f"{i:2d}. {category:<40} {count:>4} files")
    
    if len(sorted_categories) > 20:
        remaining = len(sorted_categories) - 20
        print(f"\n... and {remaining} more categories")

    # Write tips on uncategorized workflows
    print("\n" + "="*50)
    print("Tips on uncategorized workflows")
    print("="*50)
    print("1. At the search, you'll be able to list all uncategorized workflows.")
    print("2. If the workflow JSON filename has a clear service name (eg. Twilio), it could just be we are missing its category definition at context/def_categories.json.")
    print("3. You can contribute to the category definitions and then make a pull request to help improve the search experience.")


    # Done message
    print("\n" + "="*50)
    print("Done! Search re-indexed with categories.")
    print("="*50)

if __name__ == "__main__":
    main()
