import os
import sys

# Ensure backend directory is in path
sys.path.append(os.getcwd())

def test():
    print("🔬 Testing Deal and Lead mappers...")
    try:
        from app.models.deal import Deal
        print("✅ Deal imported successfully")
        from app.models.lead import Lead
        print("✅ Lead imported successfully")
        
        from sqlalchemy import inspect
        deal_mapper = inspect(Deal)
        print(f"\nDeal Relationships: {[r.key for r in deal_mapper.relationships]}")
        
        lead_mapper = inspect(Lead)
        print(f"Lead Relationships: {[r.key for r in lead_mapper.relationships]}")
        
        print("\n🚀 MAPPER STATUS: CLEAR. All AI engines are green for launch.")
    except Exception as e:
        print(f"\n❌ MAPPER STATUS: BLOCKED. Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test()
