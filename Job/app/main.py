from publish import publish_walrus_site
from get_site_id import get_site_id
from delete_site import dlete_walrus_site
from Set_Zero import set_zero
from google.cloud import firestore
import sys
import os
import json

def main():
    args = sys.argv[1:]  

    if len(args) < 1:
        print("❌ Missing operation argument. Usage: python main.py <operation> [object_id]")
        return

    operation = args[0]
    object_id = args[1] if len(args) > 1 else None

    print(f"Operation: {operation}")
    print(f"Object ID: {object_id}")

    db = firestore.Client()
    doc_ref = db.collection("showcase-data").document("reference")
    doc = doc_ref.get()

    if doc.exists:
        data = doc.to_dict()
        showcase_blob_id = data.get("BlobID", "❌ ไม่มี BlobID")
        showcase_obj_id = data.get("ObjID", "❌ ไม่มี ObjID")

        print(f"📄 Document ID: {doc.id}")
        print(f"   BlobID: {showcase_blob_id}")
        print(f"   ObjID: {showcase_obj_id}")
    else:
        print("❌ Document 'reference' ไม่พบใน collection 'showcase-data'")
        

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
    if operation == "publish":
        if not object_id:
            print("❌ Missing object_id for publish operation.")
        else:
            publish_walrus_site(object_id, showcase_obj_id, showcase_blob_id)
    elif operation == "get_site_id":
        if not object_id:
            print("❌ Missing object_id for get site id operation.")
        else:
            get_site_id(object_id)
    elif operation == "delete_site":
        if not object_id:
            print("❌ Missing object_id for delete site operation.")
        else:
            dlete_walrus_site(object_id, showcase_obj_id, showcase_blob_id)
    elif operation == "set_zero":
        set_zero(showcase_obj_id, showcase_blob_id)
    else:
        print(f"❌ Unknown operation: {operation}")

if __name__ == "__main__":
    main()
