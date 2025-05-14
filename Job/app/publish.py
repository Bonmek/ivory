import re
import shutil
import subprocess
import os
import zipfile
import json
import shlex
from handle_certified import is_certified

def publish_walrus_site(object_id):
    status = "2"  
    client_error_description = ""
    site_object_id = ""

    try:
        # STEP 1: Get blob attributes
        print("🔹 STEP 1: Get blob attributes from " + object_id)
        result = subprocess.run(
            ["walrus", "get-blob-attribute", object_id],
            check=True, capture_output=True, text=True
        )
        attributes = {}
        for line in result.stdout.strip().splitlines():
            if ':' in line:
                key, value = line.split(':', 1)
                attributes[key.strip()] = value.strip()
        print("✅ STEP 1 DONE: Attributes loaded.")


        # STEP 2: Read blob zip and extract
        print("🔹 STEP 2: Reading blob and extracting from "+ attributes["blobId"])
        try:
            subprocess.run(["walrus", "read", attributes["blobId"], "--out", "Site.zip"], check=True)
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
        
        print("📂 Extracted files in 'Site':")
        for root, dirs, files in os.walk("Site"):
            for file in files:
                full_path = os.path.join(root, file)
                print("  -", full_path)

        # STEP 3: Navigate to root folder
        print("🔹 STEP 3: Checking root folder...")
        root_path = "Site"
        if attributes["root"] != "/":
            root_path = os.path.join("Site", attributes["root"].lstrip("/"))
            if not os.path.isdir(root_path):
                client_error_description = "Cannot find root directory specified in your project."
                raise FileNotFoundError(f"❌ STEP 3 FAILED: Root path '{root_path}' not found.")
        print(f"✅ STEP 3 DONE: Navigated to root folder: {root_path}")


        # STEP 4: Run install/build
        if attributes.get("is_build") == "0":
            print("🔹 STEP 4: Running install/build commands...")
            print(f"📦 install_command: {attributes['install_command']}")
            print(f"📦 build_command: {attributes['build_command']}")
            print(f"📂 cwd: {root_path}")
            try:
                install_proc = subprocess.run(
                    shlex.split(attributes["install_command"]),
                    cwd=root_path,
                    check=True,
                    capture_output=True,
                    text=True
                )
                print("📦 npm install output:\n", install_proc.stdout)
                if install_proc.stderr:
                    print("📦 npm install warnings:\n", install_proc.stderr)

                print("🧪 Running shell command:", shlex.split(attributes["build_command"]))
                build_proc = subprocess.run(
                    shlex.split(attributes["build_command"]),
                    cwd=root_path,
                    check=True,
                    capture_output=True,
                    text=True
                )
                print("🛠️ build output:\n", build_proc.stdout, build_proc)
                if build_proc.stderr:
                    print("🛠️ build warnings:\n", build_proc.stderr)

                print("✅ STEP 4 DONE: Build completed.")
            except subprocess.CalledProcessError as e:
                client_error_description = "Cannot install or build your project. Please check your package.json and root directory."
                print("❌ STEP 4 FAILED: Install or build command failed.")
                print("STDOUT:\n", e.stdout)
                print("STDERR:\n", e.stderr)
                raise Exception("Build failed: " + (e.stderr or e.stdout or str(e)))


        # STEP 5: Find index.html
        print("🔹 STEP 5: Searching for index.html...")
        final_path = None

        if attributes.get("is_build") == "0":
            output_dir = attributes.get("output_dir")
            if output_dir:
                candidate_path = os.path.join(root_path, output_dir)
                index_path = os.path.join(candidate_path, "index.html")

                if os.path.isfile(index_path):
                    final_path = candidate_path
                    print(f"✅ STEP 5 DONE: index.html found in output_dir path: {final_path}")

            if not final_path:
                max_depth = -1
                for dirpath, _, filenames in os.walk(root_path):
                    if "index.html" in filenames:
                        relative_path = os.path.relpath(dirpath, root_path)
                        depth = relative_path.count(os.sep)
                        if depth > max_depth:
                            max_depth = depth
                            final_path = dirpath

        else:
            for dirpath, _, filenames in os.walk(root_path):
                if "index.html" in filenames:
                    final_path = dirpath
                    break

        if not final_path:
            client_error_description = "Cannot find index.html file in your project."
            raise FileNotFoundError("❌ STEP 5 FAILED: index.html not found.")
        print(f"✅ STEP 5 DONE: index.html found in {final_path}")

        # STEP 6: Create ws-resources.json
        print("🔹 STEP 6: Creating ws-resources.json...")
        cache_value = attributes.get("cache", "3600")
        default_route = attributes.get("default_route", "/index.html")
        ws_data = {
            "headers": {
                default_route: {
                    "Cache-Control": f"max-age={cache_value}"
                }
            },
            "routes": {
                "/*": default_route
            },
            "metadata": {
                "link": "https://subdomain.wal.app",
                "image_url": "https://www.walrus.xyz/walrus-site",
                "description": "This is a walrus site.",
                "project_url": "https://github.com/MystenLabs/walrus-sites/",
                "creator": "MystenLabs"
            }
        }

        with open(os.path.join(final_path, "ws-resources.json"), "w") as f:
            json.dump(ws_data, f, indent=2)
        print("✅ STEP 6 DONE: ws-resources.json created.")

        # STEP 7: Publish site
        print("🔹 STEP 7: Publishing site...")
        publish_result = subprocess.run(
            ["site-builder", "publish", final_path, "--epochs", attributes["epochs"]],
            check=True, capture_output=True, text=True
        )

        print("📤 Site Builder Output:")
        print(publish_result.stdout)

        # STEP 8: Read site_object_id
        print("🔹 STEP 8: Reading site_object_id...")
        for line in publish_result.stdout.splitlines():
            if line.startswith("New site object ID:"):
                site_object_id = line.split(":", 1)[1].strip()
                print("🆔 New site object ID:", site_object_id)
                status = "1"  # Success
                break

        if not site_object_id:
            client_error_description = "Site published but no site ID was returned. Please contact support."
            raise Exception("❌ STEP 8 FAILED: site_object_id not found in output.")

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
        # STEP 9: Update blob attributes
        print("🔹 STEP 9: Updating blob attributes...")
        attr_command = [
            "walrus", "set-blob-attribute", object_id,
            "--attr", "status", status,
            "--attr", "client_error_description", client_error_description 
        ]
        if status == "1" and site_object_id:
            attr_command += ["--attr", "site_id", site_object_id, "--attr", "showcase_url_status", "0"]

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

        # # STEP 10: Store final_path as static file in walrus
        # if status == "1" and final_path:
        #     print("🔹 STEP 10: Storing final static files to Walrus...")
        #     zip_output_path = os.path.join("/tmp", "Static_Site.zip")
        #     if os.path.exists(zip_output_path):
        #         os.remove(zip_output_path)
        #     shutil.make_archive(base_name="/tmp/Static_Site", format="zip", root_dir=final_path)
        #     store_command = [
        #         "walrus", "store", zip_output_path,
        #         "--epochs", attributes["epochs"], "--deletable"
        #     ]

        #     max_store_attempts = 3
        #     blob_id2 = None
        #     object_id2 = None

        #     for attempt in range(1, max_store_attempts + 1):
        #         try:
        #             print(f"➡️ Attempt {attempt} of {max_store_attempts}")
        #             result = subprocess.run(
        #                 store_command,
        #                 check=True,
        #                 text=True,
        #                 capture_output=True
        #             )

        #             output = result.stdout
        #             print(output)

        #             # Extract Blob ID and Sui Object ID
        #             blob_id_match = re.search(r'Blob ID:\s+(\S+)', output)
        #             object_id_match = re.search(r'Sui object ID:\s+(0x[0-9a-fA-F]+)', output)

        #             if blob_id_match:
        #                 blob_id2 = blob_id_match.group(1)
        #                 print(f"📦 Blob ID: {blob_id2}")

        #             if object_id_match:
        #                 object_id2 = object_id_match.group(1)
        #                 print(f"🧱 Sui Object ID: {object_id2}")

        #             # Check certification
        #             if not is_certified(object_id2):
        #                 print("⚠️ Object is not certified.")
        #                 if blob_id2:
        #                     delete_command = ["walrus", "delete", "--blob-id", blob_id2]
        #                     try:
        #                         result = subprocess.run(
        #                             delete_command,
        #                             check=True,
        #                             text=True,
        #                             capture_output=True
        #                         )
        #                         print("✅ Deleted blob successfully.")
        #                         print(result.stdout)
        #                     except subprocess.CalledProcessError as e:
        #                         print("❌ Failed to delete blob.")
        #                         print("STDERR:", e.stderr or str(e))
        #                 # Do not raise error, just continue to next attempt
        #                 continue

        #             # If certified
        #             print("✅ STEP 10 DONE: Static site stored in Walrus.")
        #             # ชื่อ job และ region
        #             job_name = "ivory-project-job-set-url"
        #             region = "asia-southeast1"

        #             # Argument ที่จะส่งไปให้ job
        #             args = ["showcase_url", object_id, object_id2, blob_id2]
        #             cmd = ["gcloud", "run", "jobs", "execute", job_name, "--region", region] + args
        #             # รันคำสั่ง
        #             result = subprocess.run(cmd, capture_output=True, text=True)

        #             # แสดงผลลัพธ์
        #             print("STDOUT:\n", result.stdout)
        #             print("STDERR:\n", result.stderr)
        #             break

        #         except subprocess.CalledProcessError as e:
        #             print(f"❌ STEP 10 FAILED (Attempt {attempt}): Cannot store static site in Walrus.")
        #             print("STDERR:", e.stderr or str(e))
        #             showcase_url_status = 2
        #             max_attempts = 5
        #             for attempt in range(1, max_attempts + 1):
        #                 try:
        #                     subprocess.run(["walrus", "set-blob-attribute", object_id,"--attr", "showcase_url_status", showcase_url_status], check=True)
        #                     print("✅ STEP 10 DONE: Blob attributes updated.")
        #                     break  # สำเร็จแล้ว ออกจากลูป
        #                 except subprocess.CalledProcessError as e:
        #                     print(f"❌ STEP 10 FAILED (Attempt {attempt}): Cannot update blob attributes:", e.stderr or str(e))
        #                     if attempt == max_attempts:
        #                         print("🚫 STEP 10 ERROR: All attempts to update blob attributes failed.")
                    

        #         # If last attempt fails
        #         if attempt == max_store_attempts:
        #             print("🚫 STEP 10 ERROR: All attempts to store static site failed.")
        #             showcase_url_status = 2
        #             max_attempts = 5
        #             for attempt in range(1, max_attempts + 1):
        #                 try:
        #                     subprocess.run(["walrus", "set-blob-attribute", object_id,"--attr", "showcase_url_status", showcase_url_status], check=True)
        #                     print("✅ STEP 10 DONE: Blob attributes updated.")
        #                     break  # สำเร็จแล้ว ออกจากลูป
        #                 except subprocess.CalledProcessError as e:
        #                     print(f"❌ STEP 10 FAILED (Attempt {attempt}): Cannot update blob attributes:", e.stderr or str(e))
        #                     if attempt == max_attempts:
        #                         print("🚫 STEP 10 ERROR: All attempts to update blob attributes failed.")
            
                    
