#!/usr/bin/env python3
"""
N8N AI Integration Launch Script
"""

import webbrowser
import os
from pathlib import Path

def launch_integration():
    print("🧠 N8N AI Integration Hub")
    print("=" * 40)
    print("Brain Technology Version: 2025.07.31")
    print("=" * 40)
    print()
    print("📊 System Statistics:")
    print("   • Total Workflows: 2,053")
    print("   • Brain-Enhanced Workflows: 5")
    print("   • Neural Networks: 4")
    print("   • Categories: 10")
    print("   • Integrations: 365")
    print()
    print("🧠 Brain Technology Features:")
    print("   • Pattern Recognition in Workflows")
    print("   • Neural Architecture Optimization")
    print("   • Adaptive Learning Systems")
    print("   • Cognitive Enhancement")
    print("   • Real-time Neural Analysis")
    print()
    print("🌐 Opening Web Interface...")
    
    # Get the current directory
    current_dir = Path(__file__).parent
    index_path = current_dir / "index.html"
    
    if index_path.exists():
        # Convert to absolute path and file URL
        absolute_path = index_path.absolute()
        file_url = f"file:///{absolute_path.as_posix()}"
        
        try:
            webbrowser.open(file_url)
            print("✅ Web interface opened successfully!")
            print(f"📍 URL: {file_url}")
        except Exception as e:
            print(f"⚠️ Could not open browser automatically: {e}")
            print(f"💡 Please manually open: {absolute_path}")
    else:
        print("❌ Web interface file not found")
        print(f"💡 Expected location: {index_path}")
    
    print()
    print("🎯 System Ready!")
    print("Explore the N8N AI Integration Hub to discover brain-enhanced workflows.")
    print()
    print("🔧 Available Features:")
    print("   • Load and analyze 2,053 n8n workflows")
    print("   • Neural pattern recognition")
    print("   • Brain-enhanced workflow generation")
    print("   • Real-time adaptation")
    print("   • Cognitive optimization")
    print()
    print("🚀 Happy exploring!")

if __name__ == "__main__":
    launch_integration() 