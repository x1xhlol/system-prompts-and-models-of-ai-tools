#!/usr/bin/env python3
"""
Validate repository structure and content.
Checks for:
- Missing files
- Broken links in README
- Inconsistent naming
- Empty files
- Missing metadata
"""

import os
import re
from pathlib import Path

class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def check_readme_links():
    """Check all links in README.md point to valid directories."""
    issues = []

    with open('README.md', 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all markdown links to directories
    links = re.findall(r'\[.*?\]\((\.\/[^)]+)\)', content)

    for link in links:
        # Decode URL encoding
        path = link.replace('%20', ' ')
        path = path.replace('./', '')
        path = path.rstrip('/')

        if not os.path.exists(path) and path not in ['LICENSE.md', 'README.md']:
            issues.append(f"Broken link: {link} -> {path} does not exist")

    return issues

def check_directory_consistency():
    """Check all directories are listed in README."""
    issues = []

    # Get all directories
    dirs = [d for d in os.listdir('.') if os.path.isdir(d) and d not in ['.git', 'assets', '.github', 'scripts']]

    # Read README
    with open('README.md', 'r', encoding='utf-8') as f:
        readme_content = f.read()

    for directory in dirs:
        # Check if directory is mentioned in README (flexible matching)
        if directory not in readme_content and directory.replace(' ', '%20') not in readme_content:
            issues.append(f"Directory '{directory}' not listed in README.md")

    return issues

def check_empty_files():
    """Check for empty files."""
    issues = []

    for root, dirs, files in os.walk('.'):
        # Skip .git directory
        if '.git' in root:
            continue

        for file in files:
            if file.endswith(('.txt', '.json', '.md')):
                filepath = os.path.join(root, file)
                if os.path.getsize(filepath) == 0:
                    issues.append(f"Empty file: {filepath}")

    return issues

def check_file_naming_consistency():
    """Check for inconsistent file naming patterns."""
    warnings = []

    for root, dirs, files in os.walk('.'):
        if '.git' in root or 'scripts' in root:
            continue

        for file in files:
            # Check for files without extensions that should have them
            if not any(file.endswith(ext) for ext in ['.txt', '.json', '.md', '.png', '.jpg', '.svg']):
                if file not in ['.gitignore', 'LICENSE']:
                    warnings.append(f"File without standard extension: {os.path.join(root, file)}")

            # Check for inconsistent naming (mixing underscores and spaces)
            if '_' in file and ' ' in file:
                warnings.append(f"Inconsistent naming (mixed _ and space): {os.path.join(root, file)}")

    return warnings

def check_directory_structure():
    """Check each directory has appropriate files."""
    issues = []

    for item in os.listdir('.'):
        if os.path.isdir(item) and item not in ['.git', 'assets', '.github', 'scripts']:
            files = os.listdir(item)

            # Check if directory has any content files
            has_content = any(f.endswith(('.txt', '.json', '.md')) for f in files)
            if not has_content:
                issues.append(f"Directory '{item}' has no .txt, .json, or .md files")

    return issues

def main():
    """Run all validation checks."""
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}Repository Validation{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")

    all_issues = []
    all_warnings = []

    # Run checks
    checks = [
        ("README links", check_readme_links, True),
        ("Directory consistency", check_directory_consistency, True),
        ("Empty files", check_empty_files, True),
        ("File naming", check_file_naming_consistency, False),
        ("Directory structure", check_directory_structure, True)
    ]

    for check_name, check_func, is_error in checks:
        print(f"Checking {check_name}...", end=" ")
        results = check_func()

        if results:
            if is_error:
                all_issues.extend(results)
                print(f"{Colors.RED}✗ {len(results)} issue(s){Colors.RESET}")
            else:
                all_warnings.extend(results)
                print(f"{Colors.YELLOW}⚠ {len(results)} warning(s){Colors.RESET}")
        else:
            print(f"{Colors.GREEN}✓{Colors.RESET}")

    # Print detailed results
    if all_issues:
        print(f"\n{Colors.RED}Issues found:{Colors.RESET}")
        for issue in all_issues:
            print(f"  {Colors.RED}✗{Colors.RESET} {issue}")

    if all_warnings:
        print(f"\n{Colors.YELLOW}Warnings:{Colors.RESET}")
        for warning in all_warnings:
            print(f"  {Colors.YELLOW}⚠{Colors.RESET} {warning}")

    # Summary
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    if not all_issues and not all_warnings:
        print(f"{Colors.GREEN}✓ All checks passed!{Colors.RESET}")
        return 0
    else:
        print(f"Total: {Colors.RED}{len(all_issues)} error(s){Colors.RESET}, {Colors.YELLOW}{len(all_warnings)} warning(s){Colors.RESET}")
        return 1 if all_issues else 0

if __name__ == "__main__":
    exit(main())
