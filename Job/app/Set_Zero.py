import subprocess
from google.cloud import firestore

def set_zero(showcase_obj_id, showcase_blob_id):
    showcase_site_id = "0x43781dff393952358f7df65ddbea9eaaca31d63c87be44bf72dca78269dc8cbc"
    try:
        try:
            update_result = subprocess.run(
                ["site-builder", "update", "IVORY-SHOWCASE", showcase_site_id, "--epochs", "1"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            if update_result.returncode == 0:
                print("Site updated successfully.")
            else:
                print(f"Error updating site: {update_result.stderr}")
        except Exception as e:
            print(f"Exception while updating site:", e)

        try:
            burn_result = subprocess.run(
                ["walrus", "burn-blobs", "--all"],
                input="y\n", 
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            if burn_result.returncode == 0:
                print(f"Burned blob succefully")
            else:
                print(f"Error burning blob fail")

        except Exception as e:
            print(f"Exception while burning blob:", e)

        # Store the zipped file in Walrus
        result = subprocess.run(
            ["walrus", "store", "IVORY-SHOWCASE.zip", "--epochs", "1", "--deletable", "--force"],
            check=True, capture_output=True, text=True
        )
            
        stdout = result.stdout.strip()
        new_showcase_blob_id = None
        new_showcase_object_id = None

        for line in stdout.splitlines():
            if line.startswith("Blob ID:"):
                new_showcase_blob_id = line.split(":", 1)[1].strip()
            elif line.startswith("Sui object ID:"):
                new_showcase_object_id = line.split(":", 1)[1].strip()

        if not new_showcase_blob_id or not new_showcase_object_id:
            raise RuntimeError("⚠️ ไม่พบค่า Blob ID หรือ Sui object ID จากผลลัพธ์ของคำสั่ง walrus store")

        print(f"📦 new_showcase_blob_id: {new_showcase_blob_id}")
        print(f"📦 new_showcase_object_id: {new_showcase_object_id}")

        try:
            db = firestore.Client()
            doc_ref = db.collection("showcase-data").document("reference")
            doc = doc_ref.get()

            if doc.exists:
               # ✅ อัปเดตค่าใหม่ที่ได้จาก STEP 7
                doc_ref.update({
                    "BlobID": new_showcase_blob_id,
                    "ObjID": new_showcase_object_id
                })

                print("✅ STEP 8 DONE: Firestore document updated successfully.")
                print(f"   🔁 Updated BlobID: {new_showcase_blob_id}")
                print(f"   🔁 Updated ObjID: {new_showcase_object_id}")
        except Exception as e:
            raise RuntimeError(f"STEP 8 Error: {str(e)}")


    except Exception as e:
        print("Exception occurred:", e)
        return []
    
    
