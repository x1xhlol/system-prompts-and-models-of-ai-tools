import os
import sys
import glob

# Ensure backend directory is in path
sys.path.append(os.getcwd())

from sqlalchemy import inspect
from app.database import engine
import importlib

def diagnose_all():
    print("🔍 Diagnosing ALL SQLAlchemy Mappers in app/models...")
    
    # Discovery: import all models
    model_files = glob.glob("app/models/*.py")
    for f in model_files:
        module_name = f.replace(".py", "").replace("/", ".").replace("\\", ".")
        if "base" in module_name or "__init__" in module_name:
            continue
        try:
            importlib.import_module(module_name)
            print(f"✅ Loaded {module_name}")
        except Exception as e:
            print(f"❌ Failed to load {module_name}: {e}")

    from app.models.base import Base

    try:
        # Get all mapped classes
        for name, model in Base.registry._class_registry.items():
            if isinstance(model, type):
                mapper = inspect(model)
                print(f"\nModel: {model.__name__} (Table: {model.__tablename__ if hasattr(model, '__tablename__') else 'N/A'})")
                for rel in mapper.relationships:
                    print(f"  - Relationship: {rel.key}")
                    print(f"    Target: {rel.mapper.class_.__name__}")
                    print(f"    Foreign Keys: {rel.foreign_keys}")
                    # print(f"    Primary Join: {rel.primaryjoin}")
        print("\n✅ Global Mapper inspection complete.")
    except Exception as e:
        print(f"\n❌ Error during diagnosis: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    diagnose_all()
