import subprocess


import subprocess
import time

def is_certified(blob_id):
    max_attempts = 3  # รวมครั้งแรก + อีกสองรอบ
    for attempt in range(1, max_attempts + 1):
        try:
            result = subprocess.run(
                ["walrus", "blob-status", "--blob-id", blob_id],
                check=True,
                text=True,
                capture_output=True
            )
            print(f"🌀 Attempt {attempt}:")
            print(result.stdout)

            if "Total number of certified objects" in result.stdout:
                print("✅ Blob is certified.")
                return True
            else:
                print("⚠️ Blob not certified yet.")
        except subprocess.CalledProcessError as e:
            print(f"❌ Attempt {attempt}: Failed to check blob status: {e.stderr or str(e)}")

        if attempt < max_attempts:
            print("⏳ Waiting 20 seconds before retrying...")
            time.sleep(20)

    print("❌ Blob was not certified after 3 attempts.")
    return False
