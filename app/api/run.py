# File: api/run.py
import json, tempfile, subprocess, os

def handler(request):
    try:
        body = request.json()
        code = body.get("code", "")
        # 1) Write to temp file
        fd, path = tempfile.mkstemp(suffix=".py")
        with os.fdopen(fd, "w") as f:
            f.write(code)

        # 2) Optional syntax check
        check = subprocess.run(
            ["python", "-m", "py_compile", path],
            capture_output=True, text=True
        )
        if check.returncode != 0:
            return {
                "statusCode": 400,
                "body": json.dumps({
                    "success": False,
                    "output": check.stderr
                })
            }

        # 3) Execute
        run = subprocess.run(
            ["python", path],
            capture_output=True, text=True, timeout=5
        )
        output = run.stdout or run.stderr

        return {
            "statusCode": 200,
            "body": json.dumps({
                "success": run.returncode == 0,
                "output": output
            })
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({
                "success": False,
                "output": str(e)
            })
        }
