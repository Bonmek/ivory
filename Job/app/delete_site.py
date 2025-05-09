import subprocess


def delete_walrus_site(object_id):
    description = ""

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

        if attributes.get("status") != "1":
            raise Exception("❌ STATUS is not '1' (already published).")

        site_id = attributes.get("site_id")
        if not site_id:
            raise Exception("❌ site_id not found in attributes.")

        print(f"🔹 STEP 2: Destroying site with site_id: {site_id}...")
        subprocess.run(
            ["site-builder", "destroy", site_id],
            check=True, capture_output=True, text=True
        )
        print("✅ STEP 2 DONE: Site destroyed.")

        print("🔹 STEP 3: Deleting blob...")
        subprocess.run(
            ["walrus", "delete", "--blob-id", object_id],
            check=True, capture_output=True, text=True
        )
        print("✅ STEP 3 DONE: Blob deleted.")
        # ไม่ต้องตั้งค่า delete-attribute ถ้าทุกอย่างสำเร็จ
        return

    except subprocess.CalledProcessError as e:
        description = f"Subprocess error: {e.stderr or str(e)}"
        print("❌ Error:", description)
    except Exception as e:
        description = str(e)
        print("❌ Error:", description)

    # กรณีล้มเหลว (ไม่ว่าจะขั้นตอนไหน)
    print("🔹 STEP 4: Updating blob attributes with delete-attribute=2...")
    attr_command = [
        "walrus", "set-blob-attribute", object_id,
        "--attr", "delete-attribute", "2",
        "--attr", "description", description
    ]

    try:
        subprocess.run(attr_command, check=True)
        print("✅ STEP 4 DONE: Blob attributes updated.")
    except subprocess.CalledProcessError as e:
        print("❌ STEP 4 FAILED: Cannot update blob attributes:", e.stderr or str(e))
