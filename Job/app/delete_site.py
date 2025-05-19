import shutil
import subprocess
import zipfile, os
from google.cloud import firestore

def dlete_walrus_site(object_id, showcase_obj_id, showcase_blob_id):
    status = "2"  # Default status
    client_error_description = ""
    showcase_site_id = "0x43781dff393952358f7df65ddbea9eaaca31d63c87be44bf72dca78269dc8cbc"

    try:
        # STEP 0: Check arguments
        if showcase_blob_id is None or showcase_obj_id is None:
            client_error_description = "Internal error. Please try again later."
            description = "Can't get showcase info"
            raise ValueError(description)

        # STEP 1: Get blob attributes
        print("🔹 STEP 1: Get blob attributes from " + object_id)
        try:
            result = subprocess.run(
                ["walrus", "get-blob-attribute", object_id],
                check=True, capture_output=True, text=True
            )
        except subprocess.CalledProcessError as e:
            client_error_description = "Unable to retrieve project information."
            raise RuntimeError(f"STEP 1 Error: {e.stderr or e.stdout or str(e)}")

        attributes = {}
        for line in result.stdout.strip().splitlines():
            if ':' in line:
                key, value = line.split(':', 1)
                attributes[key.strip()] = value.strip()
        print("✅ STEP 1 DONE: Attributes loaded.")

        # STEP 2: Check blob attributes
        print("🔹 STEP 2: Validate required blob attributes")
        required_attributes = [
            "site-name", "owner", "epochs",
            "start_date", "end_date", "status", "blobId"
        ]
        missing = [attr for attr in required_attributes if attr not in attributes]
        if missing:
            client_error_description = "Internal error. Please try again later."
            description = f"Missing required attribute(s): {', '.join(missing)}"
            raise ValueError(description)
        print("✅ STEP 2 DONE: All required attributes are present.")

        # STEP 3: READ SHOWCASE FILE AND EXTRACT IT
        print("🔹 STEP 3: Read SHOWCASE file and extract it")
        showcase_site_name = "Site"
        showcase_zip_filename = f"{showcase_site_name}.zip"

        try:
            subprocess.run(
                ["walrus", "read", showcase_blob_id, "--out", showcase_zip_filename],
                check=True, capture_output=True, text=True
            )
            print(f"✅ STEP 3.1 DONE: Downloaded blob as {showcase_zip_filename}")
        except subprocess.CalledProcessError as e:
            client_error_description = "Failed to download the showcase file."
            raise RuntimeError(f"STEP 3.1 Error: {e.stderr or e.stdout or str(e)}")

        try:
            os.makedirs(showcase_site_name, exist_ok=True)
            with zipfile.ZipFile(showcase_zip_filename, 'r') as zip_ref:
                zip_ref.extractall(showcase_site_name)
            print(f"✅ STEP 3.2 DONE: Extracted to ./{showcase_site_name}")
        except Exception as e:
            client_error_description = "Failed to extract the showcase zip file."
            raise RuntimeError(f"STEP 3.2 Error: {str(e)}")
        
        # STEP 4: Delete Site path fron showcase site
        print("🔹STEP 4: Delete Site path from showcase site")
        site_name = attributes["site-name"]
        owner = attributes["owner"]
        showcase_root = showcase_site_name
        destination_dir = os.path.join(showcase_root, owner)
        target_dir = os.path.join(destination_dir, site_name)

        if not os.path.exists(target_dir):
            raise RuntimeError(f"Source folder '{target_dir}' does not exist.")
        
        try:
            if os.path.exists(target_dir):
                shutil.rmtree(target_dir)

            print(f"✅ STEP 4 DONE: Delete {site_name} from {target_dir}")
        except Exception as e:
            client_error_description = "Failed to delete static site from showcase structure."
            raise RuntimeError(f"STEP 5 Error: {str(e)}")
        
        # STEP 5: UPDATE SITE
        print("🔹 STEP 5: Update site using site-builder CLI")
        try:
            epochs = attributes["epochs"]

            subprocess.run(
                ["site-builder", "update", showcase_root, showcase_site_id, "--epochs", epochs],
                check=True, capture_output=True, text=True
            )
            print(f"✅ STEP 5 DONE: Site updated with site-builder in ./{showcase_root}")

        except subprocess.CalledProcessError as e:
            client_error_description = "Site update failed during Deleting."
            raise RuntimeError(f"STEP 5 Error: {e.stderr or e.stdout or str(e)}")
        
        # STEP 6: STORE NEW SHOWCASE SITE IN WALRUS
        print("🔹 STEP 6: Zip and store updated showcase site into Walrus")
        try:
            new_showcase_zip = "new_showcase.zip"

            # Zip the showcase_root folder (e.g., 'site')
            def zip_folder(folder_path, zip_path):
                with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                    for root, _, files in os.walk(folder_path):
                        for file in files:
                            abs_path = os.path.join(root, file)
                            rel_path = os.path.relpath(abs_path, folder_path)
                            zipf.write(abs_path, rel_path)

            zip_folder(showcase_site_name, new_showcase_zip)
            print(f"✅ STEP 6.1 DONE: Zipped {showcase_site_name} -> {new_showcase_zip}")

            # Store the zipped file in Walrus
            result = subprocess.run(
                ["walrus", "store", new_showcase_zip, "--epochs", epochs, "--deletable", "--force"],
                check=True, capture_output=True, text=True
            )
            print("✅ STEP 6.2 DONE: Stored new showcase site in Walrus")
            
            stdout = result.stdout.strip()
            new_showcase_blob_id = None
            new_showcase_object_id = None

            for line in stdout.splitlines():
                if line.startswith("Blob ID:"):
                    new_showcase_blob_id = line.split(":", 1)[1].strip()
                elif line.startswith("Sui object ID:"):
                    new_showcase_object_id = line.split(":", 1)[1].strip()

            if not new_showcase_blob_id or not new_showcase_object_id:
                client_error_description = "Cannot get showcase Site id from Walrus."
                raise RuntimeError("⚠️ ไม่พบค่า Blob ID หรือ Sui object ID จากผลลัพธ์ของคำสั่ง walrus store")

            print(f"📦 new_showcase_blob_id: {new_showcase_blob_id}")
            print(f"📦 new_showcase_object_id: {new_showcase_object_id}")

        except subprocess.CalledProcessError as e:
            client_error_description = "Failed to store updated site in Walrus."
            raise RuntimeError(f"STEP 6 Error: {e.stderr or e.stdout or str(e)}")
        except Exception as e:
            client_error_description = "Unexpected error during zipping or storing."
            raise RuntimeError(f"STEP 6 Error: {str(e)}")
        
        # STEP 7: UPDATE Firestore Document with new BlobID and ObjID
        print("🔹 STEP 7: Update Firestore with new BlobID and ObjID")

        try:
            db = firestore.Client()
            doc_ref = db.collection("showcase-data").document("reference")
            doc = doc_ref.get()

            if doc.exists:
                # ✅ อัปเดตค่าใหม่ที่ได้จาก STEP 6
                doc_ref.update({
                    "BlobID": new_showcase_blob_id,
                    "ObjID": new_showcase_object_id
                })

                print("✅ STEP 7 DONE: Firestore document updated successfully.")
                print(f"   🔁 Updated BlobID: {new_showcase_blob_id}")
                print(f"   🔁 Updated ObjID: {new_showcase_object_id}")
                status = "3"
        except Exception as e:
            client_error_description = "Error while updating Firestore."
            raise RuntimeError(f"STEP 7 Error: {str(e)}")
        
        # STEP 8: DELETE OLD SHOWCASE BLOB
        print("🔹 STEP 8: Delete old showcase blob from Walrus")

        try:
            result = subprocess.run(
                 ["walrus", "delete", "--blob-id", showcase_blob_id, "--yes", "--no-status-check"],
                 check=True, capture_output=True, text=True
            )
            print("✅ STEP 8 DONE: Old showcase blob deleted successfully.")

        except subprocess.CalledProcessError as e:
            client_error_description = "Failed to delete old showcase blob from Walrus."
            raise RuntimeError(f"STEP 8 Error: {e.stderr or e.stdout or str(e)}")
        except Exception as e:
            client_error_description = "Unexpected error during blob deletion."
            raise RuntimeError(f"STEP 8 Error: {str(e)}")
        
        # STEP 9: Destroy SITE FROM WALRUS
        print("🔹 STEP 9: Destroy site from Walrus")
        if attributes.get("site_id") is not None:
            try:
                site_id = attributes["site_id"]
                result = subprocess.run(
                    ["site-builder", "destroy", site_id],
                    check=True, capture_output=True, text=True
                )
                print(f"✅ STEP 9 DONE: Site {site_id} destroyed from Walrus")
            except subprocess.CalledProcessError as e:
                client_error_description = "Failed to destroy site from Walrus."
                raise RuntimeError(f"STEP 9 Error: {e.stderr or e.stdout or str(e)}")
        else :
            print("user not have site id yet")

        # STEP 10: Destroy SITE FROM WALRUS
        print("🔹 STEP 10: Destroy Blob from Walrus")
        try:
            result = subprocess.run(
                ["walrus", "burn-blobs", "--object-ids", object_id],
                input="y\n",check=True, capture_output=True, text=True
            )
            print(f"✅ STEP 10 DONE: Blob {object_id} destroyed from Walrus")
        except subprocess.CalledProcessError as e:
            client_error_description = "Failed to destroy Blob from Walrus."
            raise RuntimeError(f"STEP 10 Error: {e.stderr or e.stdout or str(e)}")

    except subprocess.CalledProcessError as e:
        description = f"Subprocess error: {e.stderr or str(e)}"
        if not client_error_description:
            client_error_description = "Internal system error. Please try again later."
        print("❌ Error:", description)
    except Exception as e:
        description = str(e)
        if not client_error_description:
            client_error_description = "Unexpected error occurred. Please try again later."
        print("❌ Error:", description)
    finally:
        print("🔹 LAST STEP: Updating blob attributes...")
        attr_command = [
            "walrus", "set-blob-attribute", object_id,
            "--attr", "status", status,
            "--attr", "client_error_description", client_error_description
        ]

        try:
            subprocess.run(attr_command, check=True, capture_output=True, text=True)
            print("✅ LAST STEP DONE: Blob attributes updated.")
        except subprocess.CalledProcessError as e:
            print(f"❌ LAST STEP FAILED Cannot update blob attributes:", e.stderr or str(e))

