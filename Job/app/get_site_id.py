import re
import subprocess
import zipfile, os

def get_site_id(object_id):
    site_status = "2"  
    client_error_description = ""
    site_id = ""

    try:
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
            "start_date", "end_date", "site_status", "blobId", "status"
        ]
        missing = [attr for attr in required_attributes if attr not in attributes]
        if missing:
            client_error_description = "Internal error. Please try again later."
            description = f"Missing required attribute(s): {', '.join(missing)}"
            raise ValueError(description)
        
        if attributes["status"] != "1" :
            client_error_description = "Internal error. Please try again later. "
            description = "Showcase status still fail. pls try publish on showcase site again before use this service."
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
            with zipfile.ZipFile(zip_filename, 'r') as zip_ref:
                zip_ref.extractall(site_name)
            print(f"✅ STEP 3.2 DONE: Extracted to ./{site_name}")
        except Exception as e:
            client_error_description = "Failed to extract the site zip file."
            raise RuntimeError(f"STEP 3.2 Error: {str(e)}")
        
        # STEP 4: PUBLISH SITE
        print("🔹 STEP 4: PUBLISH site using site-builder CLI")
        try:
            epochs = attributes["epochs"]
            if "site_id" not in attributes or attributes["site_id"] is None:
                result = subprocess.run(
                    ["site-builder", "publish", site_name, "--epochs", epochs],
                    check=True, capture_output=True, text=True
                )

                output = result.stdout

                # ใช้ regex เพื่อดึง site object ID
                match = re.search(r"New site object ID:\s+(0x[a-fA-F0-9]+)", output)
                if match:
                    site_id = match.group(1)
                    print(f"✅ STEP 4 DONE: Site published with site-builder in ./{site_name}")
                    print(f"🆔 Site ID: {site_id}")
                else:
                    raise ValueError("Site ID not found in the output.")
            else :
                site_id = attributes["site_id"]
                subprocess.run(
                    ["site-builder", "update",  "--epochs", epochs, site_name, site_id],
                    check=True, capture_output=True, text=True
                )

            site_status = "1"

        except subprocess.CalledProcessError as e:
            client_error_description = "Site update failed during publishing."
            raise RuntimeError(f"STEP 4 Error: {e.stderr or e.stdout or str(e)}")
        

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
            "--attr", "site_status", site_status,
            "--attr", "client_error_description", client_error_description
        ]
        if site_status == "1":
            attr_command += ["--attr", "site_id", site_id]

        try:
            subprocess.run(attr_command, check=True, capture_output=True, text=True)
            print("✅ LAST STEP DONE: Blob attributes updated.")
        except subprocess.CalledProcessError as e:
            print(f"❌ LAST STEP FAILED Cannot update blob attributes:", e.stderr or str(e))
