import subprocess
import os
import zipfile
import json
import shlex

def update_walrus_site(object_id):
    status = "2"  # เริ่มต้นด้วยสถานะล้มเหลว
    description = ""
    client_error_description = ""
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
            client_error_description = "Fail to connect to database right now, please try again later."
            raise Exception(f"❌ STEP 2 FAILED: walrus read failed. stderr: {e.stderr or e}")

        with zipfile.ZipFile("Site.zip", 'r') as zip_ref:
            bad_file = zip_ref.testzip()
            if bad_file:
                client_error_description = "The zip file is corrupted."
                raise Exception(f"❌ Corrupt zip file. First bad file: {bad_file}")
            zip_ref.extractall("Site")

        print("✅ STEP 2 DONE: Site.zip extracted.")

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
            ["site-builder", "update", "--epochs", attributes["epochs"], final_path, attributes["site_id"]],
            check=True, capture_output=True, text=True
        )

        print("📤 Site Builder Output:")
        print(publish_result.stdout)

        # STEP 8: Read site_object_id
        print("🔹 STEP 8: Reading site_object_id...")
        for line in publish_result.stdout.splitlines():
            if line.startswith("Site object ID:"):
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
            "--attr", "description", description if description else "Success",
            "--attr", "client_error_description", client_error_description if client_error_description else "Success"
        ]
        if status == "1" and site_object_id:
            attr_command += ["--attr", "site_id", site_object_id]

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
