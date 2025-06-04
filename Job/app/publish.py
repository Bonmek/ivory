import shutil
import subprocess
import zipfile, os
from google.cloud import firestore
from get_site_id import get_site_id

def publish_walrus_site(object_id, showcase_obj_id, showcase_blob_id):
    status = "2"  # Default status
    client_error_description = ""
    showcase_url = ""
    showcase_site_id = "0x8ea2941b08cad8b5b667fab8cffc26d4fc8bdaa00366e9d2e0dd233f46ee84bc"

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
            "start_date", "end_date", "status", "blobId", "type"
        ]
        missing = [attr for attr in required_attributes if attr not in attributes]
        if missing:
            client_error_description = "Internal error. Please try again later."
            description = f"Missing required attribute(s): {', '.join(missing)}"
            raise ValueError(description)
        print("✅ STEP 2 DONE: All required attributes are present.")

        # STEP 3: READ STATIC FILE AND EXTRACT IT
        print("🔹 STEP 3: Read static file and extract it")
        blob_id = attributes["blobId"]
        site_name = attributes["site-name"]
        zip_filename = f"{site_name}.zip"

        try:
            subprocess.run(
                ["walrus", "read", blob_id, "--out", zip_filename],
                check=True, capture_output=True, text=True
            )
            print(f"✅ STEP 3.1 DONE: Downloaded blob as {zip_filename}")
        except subprocess.CalledProcessError as e:
            client_error_description = "Failed to download the site file."
            raise RuntimeError(f"STEP 3.1 Error: {e.stderr or e.stdout or str(e)}")

        try:
            os.makedirs(site_name, exist_ok=True)
            if attributes["type"] != ".zip" :
                with zipfile.ZipFile(zip_filename, 'r') as zip_ref:
                    zip_ref.extractall(site_name)
                print(f"✅ STEP 3.2 DONE: Extracted to ./{site_name}")
            else :
                # ลบโฟลเดอร์เดิมถ้ามี
                if os.path.isdir(site_name):
                    shutil.rmtree(site_name)
                shutil.move(zip_filename, site_name+ ".zip")
                print(f"✅ STEP 3.2 DONE: Moved {zip_filename} to ./{site_name}")
        except Exception as e:
            client_error_description = "Failed to extract the site zip file."
            raise RuntimeError(f"STEP 3.2 Error: {str(e)}")

        # STEP 4: READ SHOWCASE FILE AND EXTRACT IT
        print("🔹 STEP 4: Read SHOWCASE file and extract it")
        if site_name == "site":
            showcase_site_name = "Site"
        else:
            showcase_site_name = "site"
        showcase_zip_filename = f"{showcase_site_name}.zip"

        try:
            subprocess.run(
                ["walrus", "read", showcase_blob_id, "--out", showcase_zip_filename],
                check=True, capture_output=True, text=True
            )
            print(f"✅ STEP 4.1 DONE: Downloaded blob as {showcase_zip_filename}")
        except subprocess.CalledProcessError as e:
            client_error_description = "Failed to download the showcase file."
            raise RuntimeError(f"STEP 4.1 Error: {e.stderr or e.stdout or str(e)}")

        try:
            os.makedirs(showcase_site_name, exist_ok=True)
            with zipfile.ZipFile(showcase_zip_filename, 'r') as zip_ref:
                zip_ref.extractall(showcase_site_name)
            print(f"✅ STEP 4.2 DONE: Extracted to ./{showcase_site_name}")
        except Exception as e:
            client_error_description = "Failed to extract the showcase zip file."
            raise RuntimeError(f"STEP 4.2 Error: {str(e)}")
        
        # STEP 5: ADD STATIC SITE TO SHOWCASE
        print("🔹 STEP 5: ADD STATIC SITE TO SHOWCASE")
        owner = attributes["owner"]
        showcase_root = showcase_site_name
        destination_dir = os.path.join(showcase_root, owner)
        if attributes["type"] != ".zip" :
            target_dir = os.path.join(destination_dir, site_name)

            if not os.path.exists(site_name):
                raise RuntimeError(f"Source folder '{site_name}' does not exist.")
            
            try:
                os.makedirs(destination_dir, exist_ok=True)

                if os.path.exists(target_dir):
                    shutil.rmtree(target_dir)

                shutil.move(site_name, target_dir)

                print(f"✅ STEP 5 DONE: Moved {site_name} to {target_dir}")
            except Exception as e:
                client_error_description = "Failed to move static site into showcase structure."
                raise RuntimeError(f"STEP 5 Error: {str(e)}")
        else :
            site_name = site_name + ".zip"
            target_dir = os.path.join(destination_dir, site_name)

            if not os.path.exists(site_name):
                raise RuntimeError(f"Source folder '{site_name}' does not exist.")
            
            try:
                os.makedirs(destination_dir, exist_ok=True)

                if os.path.exists(target_dir):
                    os.remove(target_dir)

                shutil.move(site_name, target_dir)

                print(f"✅ STEP 5 DONE: Moved {site_name} to {target_dir}")
            except Exception as e:
                client_error_description = "Failed to move static site into showcase structure."
                raise RuntimeError(f"STEP 5 Error: {str(e)}")
        
        # STEP 6: UPDATE SITE
        print("🔹 STEP 6: Update site using site-builder CLI")
        try:
            epochs = attributes["epochs"]

            subprocess.run(
                ["site-builder", "update", "--check-extend", showcase_root, showcase_site_id, "--epochs", "2"],
                check=True, capture_output=True, text=True
            )
            print(f"✅ STEP 6 DONE: Site updated with site-builder in ./{showcase_root}")
            showcase_url = target_dir[5:]

        except subprocess.CalledProcessError as e:
            client_error_description = "Site update failed during publishing."
            raise RuntimeError(f"STEP 6 Error: {e.stderr or e.stdout or str(e)}")
        
        # STEP 7: STORE NEW SHOWCASE SITE IN WALRUS
        print("🔹 STEP 7: Zip and store updated showcase site into Walrus")
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
            print(f"✅ STEP 7.1 DONE: Zipped {showcase_site_name} -> {new_showcase_zip}")

            # Store the zipped file in Walrus
            result = subprocess.run(
                ["walrus", "store", new_showcase_zip, "--epochs", "2", "--deletable", "--force"],
                check=True, capture_output=True, text=True
            )
            print("✅ STEP 7.2 DONE: Stored new showcase site in Walrus")
            
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
            raise RuntimeError(f"STEP 7 Error: {e.stderr or e.stdout or str(e)}")
        except Exception as e:
            client_error_description = "Unexpected error during zipping or storing."
            raise RuntimeError(f"STEP 7 Error: {str(e)}")
        
        # STEP 8: UPDATE Firestore Document with new BlobID and ObjID
        print("🔹 STEP 8: Update Firestore with new BlobID and ObjID")

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
                status = "1"
        except Exception as e:
            client_error_description = "Error while updating Firestore."
            raise RuntimeError(f"STEP 8 Error: {str(e)}")
        
        # STEP 9: DELETE OLD SHOWCASE BLOB
        print("🔹 STEP 9: Delete old showcase blob from Walrus")

        try:
            result = subprocess.run(
                 ["walrus", "delete", "--blob-id", showcase_blob_id, "--yes", "--no-status-check"],
                 check=True, capture_output=True, text=True
            )
            print("✅ STEP 9 DONE: Old showcase blob deleted successfully.")

        except subprocess.CalledProcessError as e:
            client_error_description = "Failed to delete old showcase blob from Walrus."
            raise RuntimeError(f"STEP 9 Error: {e.stderr or e.stdout or str(e)}")
        except Exception as e:
            client_error_description = "Unexpected error during blob deletion."
            raise RuntimeError(f"STEP 9 Error: {str(e)}")

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
        if status == "1":
            attr_command += ["--attr", "showcase_url", showcase_url]

        try:
            subprocess.run(attr_command, check=True, capture_output=True, text=True)
            print("✅ LAST STEP DONE: Blob attributes updated.")
        except subprocess.CalledProcessError as e:
            print(f"❌ LAST STEP FAILED Cannot update blob attributes:", e.stderr or str(e))

        if attributes.get("site_id") is not None:
            get_site_id(object_id)

