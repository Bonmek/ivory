from datetime import datetime, timezone
import re
import subprocess
import os

def get_walrus_info():
    try:
        result = subprocess.run(["walrus", "info"],
                                capture_output=True, text=True)

        if result.returncode != 0:
            print({
                "success": False,
                "stderr": result.stderr.strip().split("\n"),
                "exit_code": result.returncode
            })
            return

        stdout_lines = result.stdout.strip().splitlines()
        response = {}

        for line in stdout_lines:
            if line.startswith("Current epoch:"):
                response["current_epoch"] = int(line.split(":")[1].strip())
            elif line.startswith("Start time:"):
                raw_time = line.split(": ", 1)[1].strip()
                try:
                    dt = datetime.strptime(raw_time, "%Y-%m-%d %H:%M:%S.%f %Z")
                    response["start_time"] = dt.replace(tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")
                except ValueError:
                    response["start_time"] = raw_time
            elif line.startswith("End time:"):
                raw_time = line.split(": ", 1)[1].strip()
                try:
                    dt = datetime.strptime(raw_time, "%Y-%m-%d %H:%M:%S.%f %Z")
                    response["end_time"] = dt.replace(tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")
                except ValueError:
                    response["end_time"] = raw_time
            elif line.startswith("Epoch duration:"):
                match = re.search(r"(\d+)", line)
                if match:
                    response["epoch_duration_Days"] = float(match.group(1))
            elif "stored for at most" in line:
                match = re.search(r"at most (\d+) epochs", line)
                if match:
                    response["max_epoch"] = int(match.group(1))
            elif line.startswith("Maximum blob size:"):
                response["maximum_blob_size_GiB"] = float(line.split(":")[1].strip().split(" ")[0])
            elif "Price per encoded storage unit" in line:
                match = re.search(r"([\d.]+) WAL", line)
                if match:
                    response["price_per_encoded_storage_unit_WAL"] = float(match.group(1))
            elif "Additional price for each write" in line:
                match = re.search(r"([\d,]+) FROST", line)
                if match:
                    response["additional_price_per_write_FROST"] = int(match.group(1).replace(",", ""))

        print({
            "success": True,
            "data": response ,
            "check_client" : os.environ.get("SUI_KEYSTORE_CONTENT")
        })

    except Exception as e:
        print({
            "success": False,
            "error": str(e)
        })