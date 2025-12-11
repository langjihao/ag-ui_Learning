import requests
import json
import sys

url = "http://localhost:8001/webhook/agent/message"
payload = {
    "chatInput": "你好",
    "appState": {
        "currentPage": "test",
        "pageData": []
    }
}

print(f"Sending request to {url}...")
try:
    with requests.post(url, json=payload, stream=True) as r:
        r.raise_for_status()
        print("Response status:", r.status_code)
        print("Response chunks:")
        for line in r.iter_lines():
            if line:
                decoded_line = line.decode('utf-8')
                print(f"Received: {decoded_line}")
                try:
                    json.loads(decoded_line)
                    print("  -> Valid JSON")
                except json.JSONDecodeError:
                    print("  -> INVALID JSON")
except Exception as e:
    print(f"Error: {e}")
