import subprocess
import os
import zipfile
import json
import shlex

def publish_walrus_site(object_id):
    status = "2"  # เริ่มต้นด้วยสถานะล้มเหลว
    description = ""
    site_object_id = ""

    try:
        print("🔹 STEP 1: Get blob attributes...")
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
        print("🔹 STEP 2: Reading blob and extracting...")
        try:
            subprocess.run(["walrus", "read", attributes["blobId"], "--out", "Site.zip"], check=True)
        except subprocess.CalledProcessError as e:
            raise Exception(f"❌ STEP 2 FAILED: walrus read failed. stderr: {e.stderr or e}")

        with zipfile.ZipFile("Site.zip", 'r') as zip_ref:
            zip_ref.extractall("Site")

        print("✅ STEP 2 DONE: Site.zip extracted.")

        # STEP 3: Navigate to root folder
        print("🔹 STEP 3: Checking root folder...")
        root_path = "Site"
        if attributes["root"] != "/":
            root_path = os.path.join("Site", attributes["root"].lstrip("/"))
            if not os.path.isdir(root_path):
                raise FileNotFoundError(f"❌ STEP 3 FAILED: Root path '{root_path}' not found.")
        print(f"✅ STEP 3 DONE: Navigated to root folder: {root_path}")

        # STEP 4: Run install/build
        if attributes.get("is_build") == "0":
            print("🔹 STEP 4: Running install/build commands...")
            subprocess.run(shlex.split(attributes["install_command"]), cwd=root_path, check=True)
            subprocess.run(shlex.split(attributes["build_command"]), cwd=root_path, check=True)
            print("✅ STEP 4 DONE: Build completed.")

        # STEP 5: Find index.html
        print("🔹 STEP 5: Searching for index.html...")
        final_path = None
        for dirpath, _, filenames in os.walk(root_path):
            if "index.html" in filenames:
                final_path = dirpath
                break
        if not final_path:
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
            raise Exception("❌ STEP 8 FAILED: site_object_id not found in output.")

    except subprocess.CalledProcessError as e:
        description = f"Subprocess error: {e.stderr or str(e)}"
        print("❌ Error:", description)
    except Exception as e:
        description = str(e)
        print("❌ Error:", description)
    finally:
        # STEP 10: Update blob attributes
        print("🔹 STEP 9: Updating blob attributes...")
        attr_command = [
            "walrus", "set-blob-attribute", object_id,
            "--attr", "status", status,
            "--attr", "description", description if description else "Success"
        ]
        if status == "1" and site_object_id:
            attr_command += ["--attr", "site_id", site_object_id]

        try:
            subprocess.run(attr_command, check=True)
            print("✅ STEP 9 DONE: Blob attributes updated.")
        except subprocess.CalledProcessError as e:
            print("❌ STEP 9 FAILED: Cannot update blob attributes:", e.stderr or str(e))
