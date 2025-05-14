import os
import re
import shutil
import subprocess
import zipfile
from google.cloud import firestore
from handle_certified import is_certified
#stop bug pls

def showcase(objId, objId2, blobid2) :
    db = firestore.Client()
    doc_ref = db.collection(u'showcase-data').document(u'reference')
    doc = doc_ref.get()
    if doc.exists:
        print(f'Document data: {doc.to_dict()}')
        doc_data = doc.to_dict()
         # ดึงค่า BlobID และ ObjID
        showcase_blob_id = doc_data.get('BlobID')  # แก้ไขให้ตรงกับชื่อ field ของคุณ
        showcase_obj_id = doc_data.get('ObjID')    # แก้ไขให้ตรงกับชื่อ field ของคุณ
        
        print(f"BlobID: {showcase_blob_id}")
        print(f"ObjID: {showcase_obj_id}")
    else:
        print('No such document!')
    try:
        showcase_url = ""
        showcase_site_id = "0xbb75f243d6b611b8ef3ee3faa8697a0565283eb789cb9a4b6458b6447233a65c"
        print("🔹 STEP 1: Get blob attributes...")
        result = subprocess.run(
            ["walrus", "get-blob-attribute", objId],
            check=True, capture_output=True, text=True
        )

        attributes = {}
        for line in result.stdout.strip().splitlines():
            if ':' in line:
                key, value = line.split(':', 1)
                attributes[key.strip()] = value.strip()

        print("✅ STEP 1 DONE: Attributes loaded.")

        # STEP 2: Read blob zip and extract
        print("🔹 STEP 2: Reading blob and extracting...")
        try:
            subprocess.run(["walrus", "read", blobid2, "--out", "Site.zip"], check=True)
        except subprocess.CalledProcessError as e:
            client_error_description = "Fail to connect to database right now, please try again later."
            raise Exception(f"❌ STEP 2 FAILED: walrus read failed. stderr: {e.stderr or e}")

        with zipfile.ZipFile("Site.zip", 'r') as zip_ref:
            bad_file = zip_ref.testzip()
            if bad_file:
                client_error_description = "The zip file is corrupted."
                raise Exception(f"❌ Corrupt zip file. First bad file: {bad_file}")
            zip_ref.extractall("Site")

        print("✅ STEP 2 DONE: Site.zip extracted.")

        print("🔹 STEP 3: Checking for index.html...")
        index_path = os.path.join("Site", "index.html")
        if not os.path.isfile(index_path):
            client_error_description = "The extracted site does not contain an index.html file."
            raise Exception("❌ STEP 3 FAILED: index.html not found in extracted folder.")
        print("✅ STEP 3 DONE: index.html found.")

        # STEP 4: Read blob zip and extract
        print("🔹 STEP 4: Reading blob and extracting...")
        try:
            subprocess.run(["walrus", "read", showcase_blob_id, "--out", "showcase.zip"], check=True)
        except subprocess.CalledProcessError as e:
            client_error_description = "Fail to connect to database right now, please try again later."
            raise Exception(f"❌ STEP 2 FAILED: walrus read failed. stderr: {e.stderr or e}")

        with zipfile.ZipFile("showcase.zip", 'r') as zip_ref:
            bad_file = zip_ref.testzip()
            if bad_file:
                client_error_description = "The zip file is corrupted."
                raise Exception(f"❌ Corrupt zip file. First bad file: {bad_file}")
            zip_ref.extractall("showcase")

        print("✅ STEP 4 DONE: Site.zip extracted.")

        # STEP 5: Create folder structure and move files
        print("🔹 STEP 5: Creating folders and moving files...")

        # ดึงค่าจาก attribute ที่ได้จาก STEP 1 (สมมุติว่าเรามีข้อมูล owner และ site-name)
        owner = attributes.get('owner')
        site_name = attributes.get('site-name')

        # สร้างโฟลเดอร์ตามลำดับ
        showcase_dir = os.path.join("showcase", owner)
        site_dir = os.path.join(showcase_dir, site_name)
        
        if os.path.exists(site_dir):
            shutil.rmtree(site_dir) 
        # สร้างโฟลเดอร์หากยังไม่มี
        os.makedirs(site_dir, exist_ok=True)

        # ย้ายไฟล์จาก Site ไปยัง site_name
        site_folder = "Site"  # โฟลเดอร์ที่เก็บไฟล์จาก Site.zip
        for filename in os.listdir(site_folder):
            file_path = os.path.join(site_folder, filename)
            if os.path.isfile(file_path):
                shutil.copy(file_path, site_dir)  # คัดลอกไฟล์จาก Site ไปยังโฟลเดอร์ที่สร้างขึ้น

        print(f"✅ STEP 5 DONE: Files moved to {site_dir}.")

        # STEP 6: Run site-builder update
        print("🔹 STEP 6: Updating showcase with site-builder...")

        # กำหนด path showcase และ showcase_site_id ที่ได้จากข้อมูล
        showcase_path = "showcase"
        # สั่งให้ site-builder update
        try:
            subprocess.run(
                ["site-builder", "update", showcase_path, showcase_site_id, "--epochs", "1"],
                check=True
            )
            print("✅ STEP 6 DONE: Showcase updated successfully.")

            subprocess.run(
                ["walrus", "delete", objId2, "--yes"],
                check=True
            )
            showcase_url_status = 1
            showcase_url = os.path.join(owner, site_name)
        except subprocess.CalledProcessError as e:
            print(f"❌ STEP 6 FAILED: {e.stderr or str(e)}")

        print("🔹 STEP 7: Zipping showcase folder...")
        zip_filename = "showcase.zip" 
        try :
            with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zip_ref:
                for root, dirs, files in os.walk(showcase_path):
                    for file in files:
                        file_path = os.path.join(root, file)
                        zip_ref.write(file_path, os.path.relpath(file_path, showcase_path))
            print(f"✅ Showcase folder zipped into: {zip_filename}")

            print("🔹 STEP 8: Storing showcase...")

            max_store_attempts = 3
            new_showcase_blob_id = None
            new_showcase_object_id = None

            for attempt in range(1, max_store_attempts + 1):
                try:
                    print(f"➡️ Attempt {attempt} of {max_store_attempts}")
                    result = subprocess.run(
                        ["walrus", "store", zip_filename, "--epochs", "1"],
                        check=True, capture_output=True, text=True
                    )

                    output = result.stdout
                    print(output)

                    # Extract Blob ID and Sui Object ID
                    blob_id_match = re.search(r'Blob ID:\s+(\S+)', output)
                    object_id_match = re.search(r'Sui object ID:\s+(0x[0-9a-fA-F]+)', output)

                    if blob_id_match:
                        new_showcase_blob_id = blob_id_match.group(1)
                        print(f"📦 Blob ID: {new_showcase_blob_id}")

                    if object_id_match:
                        new_showcase_object_id = object_id_match.group(1)
                        print(f"🧱 Sui Object ID: {new_showcase_object_id}")

                    # Check certification
                    if not is_certified(new_showcase_object_id):
                        print("⚠️ Object is not certified.")
                        if new_showcase_object_id:
                            delete_command = ["walrus", "delete", "--blob-id", new_showcase_object_id]
                            try:
                                result = subprocess.run(
                                    delete_command,
                                    check=True,
                                    text=True,
                                    capture_output=True
                                )
                                print("✅ Deleted blob successfully.")
                                print(result.stdout)
                            except subprocess.CalledProcessError as e:
                                print("❌ Failed to delete blob.")
                                print("STDERR:", e.stderr or str(e))
                        # Do not raise error, just continue to next attempt
                        continue

                    # If certified
                    print("✅ STEP 10 DONE: Static site stored in Walrus.")
                    subprocess.run(
                        ["walrus", "delete", showcase_obj_id, "--yes"],
                        check=True
                    )
                    new_data = {
                        'BlobID': new_showcase_blob_id,
                        'ObjID': new_showcase_object_id
                    }
                    doc_ref.set(new_data)
                    break
                except subprocess.CalledProcessError as e:
                    pass

        except subprocess.CalledProcessError as e:
            description = f"Subprocess error: {e.stderr or str(e)}"
            if not client_error_description:
                client_error_description = "Internal system error. Please try again later."
            print("❌ Error:", description)
            showcase_url_status = 2
    except Exception as e:
        description = str(e)
        if not client_error_description:
            client_error_description = "Unexpected error occurred. Please try again later."
        print("❌ Error:", description)
        showcase_url_status = 2
    finally:
        # STEP 9: Update blob attributes
        print("🔹 STEP 9: Updating blob attributes...")
        attr_command = [
            "walrus", "set-blob-attribute", objId,
            "--attr", "showcase_url_status", showcase_url_status,
            "--attr", "description", description if description else "Success",
            "--attr", "client_error_description", client_error_description if client_error_description else "Success"
        ]
        if showcase_url_status == "1":
            attr_command += ["--attr", "showcase_url", showcase_url]

        max_attempts = 5
        for attempt in range(1, max_attempts + 1):
            try:
                subprocess.run(attr_command, check=True)
                print("✅ STEP 9 DONE: Blob attributes updated.")
                break  # สำเร็จแล้ว ออกจากลูป
            except subprocess.CalledProcessError as e:
                print(f"❌ STEP 9 FAILED (Attempt {attempt}): Cannot update blob attributes:", e.stderr or str(e))
                if attempt == max_attempts:
                    print("🚫 STEP 9 ERROR: All attempts to update blob attributes failed.")