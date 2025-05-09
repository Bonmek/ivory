from walrus_info import get_walrus_info
from publish import publish_walrus_site
from delete_site import delete_walrus_site
from update import update_walrus_site
import sys
import os
import json

def main():
    args = sys.argv[1:]  # รับ argument จาก command line

    if len(args) < 1:
        print("❌ Missing operation argument. Usage: python main.py <operation> [object_id]")
        return

    operation = args[0]
    object_id = args[1] if len(args) > 1 else None

    # ✅ อ่าน keystore จาก environment
    keystore_content = os.environ.get("SUI_KEYSTORE_CONTENT")
    if keystore_content:
        keystore_path = "/root/.sui/sui_config/sui.keystore"
        try:
            os.makedirs(os.path.dirname(keystore_path), exist_ok=True)
            with open(keystore_path, "w") as f:
                json.dump([keystore_content], f, indent=2)
            print("✅ sui.keystore created successfully.")
        except Exception as e:
            print(f"❌ Failed to write keystore: {e}")

    # ✅ ทำตาม operation
    if operation == "walrus_info":
        get_walrus_info()
    elif operation == "publish":
        if not object_id:
            print("❌ Missing object_id for publish operation.")
        else:
            publish_walrus_site(object_id)
    elif operation == "delete":
        if not object_id:
            print("❌ Missing object_id for delete operation.")
        else:
            delete_walrus_site(object_id)
    elif operation == "update":
        if not object_id:
            print("❌ Missing object_id for update operation.")
        else:
            update_walrus_site(object_id)
    else:
        print(f"❌ Unknown operation: {operation}")

if __name__ == "__main__":
    main()
