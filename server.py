"""
WORKNEX Enterprise Server
Microsoft Global Hackathon Prototype
Zero-Dependency Python 3 Server with Static Asset Delivery & REST API
"Less status chasing. More progress."
"""

import os
import sys
import json
import socket
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

# Ensure directory is this file's folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(BASE_DIR)

DEFAULT_PORT = 8000


class WorknexHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS for local hackathon testing
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        # Cache control for fresh demo presentation
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)

        # REST API Endpoints
        if parsed.path == "/api/health":
            self.send_json_response({
                "status": "healthy",
                "app": "WORKNEX",
                "tagline": "Less status chasing. More progress.",
                "hackathon": "Microsoft Global Hackathon",
                "manager": "Avni",
                "portal": "Manager Portal",
                "engine": "FlowAI Project Intelligence Engine",
                "version": "1.0.0-enterprise"
            })
            return

        if parsed.path == "/api/info":
            self.send_json_response({
                "product": "WORKNEX",
                "tagline": "Less status chasing. More progress.",
                "manager": "Avni",
                "systemDate": "2026-09-29",
                "traceabilityGuarantee": "Zero Hallucination with Authorized Source Attribution",
                "privacyCompliant": True,
                "surveillanceFree": True
            })
            return

        # Clean route for Employee Portal
        if parsed.path == "/employee" or parsed.path == "/employee/":
            self.path = "/employee.html"

        # Default static file handler
        if parsed.path == "/" or parsed.path == "":
            self.path = "/index.html"

        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        try:
            payload = json.loads(body)
        except Exception:
            payload = {}

        if parsed.path == "/api/audit/log":
            self.send_json_response({
                "success": True,
                "logged": payload,
                "timestamp": "2026-09-29 20:16:00"
            })
            return

        self.send_response(404)
        self.end_headers()

    def send_json_response(self, data, status_code=200):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode("utf-8"))


def find_available_port(start_port=DEFAULT_PORT):
    port = start_port
    while port < start_port + 50:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            if sock.connect_ex(("127.0.0.1", port)) != 0:
                return port
            port += 1
    return DEFAULT_PORT


def main():
    port = find_available_port(DEFAULT_PORT)
    server_address = ("", port)
    httpd = HTTPServer(server_address, WorknexHandler)

    url = f"http://localhost:{port}"

    print("=" * 68)
    print("  WORKNEX — ASYNCHRONOUS TEAM PROGRESS & INTELLIGENCE")
    print("  'Less status chasing. More progress.'")
    print("  Microsoft Global Hackathon — Dual Role-Based Portals")
    print("=" * 68)
    print(f"  • Manager Portal (Avni):      {url}")
    print(f"  • Employee Portal (Aadarsh):   {url}/employee.html (or {url}/#employee)")
    print(f"  • REST API Endpoint:          {url}/api/health")
    print("  ------------------------------------------------------------")
    print("  Demo Manager:   avni@worknex.demo     / Manager@123")
    print("  Demo Employee:  aadarsh@worknex.demo  / Employee@123")
    print("=" * 68)
    print("  Press Ctrl+C to stop the server.\n")

    if "--no-browser" not in sys.argv:
        try:
            webbrowser.open(url)
        except Exception:
            pass

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down WORKNEX server gracefully...")
        httpd.server_close()
        sys.exit(0)


if __name__ == "__main__":
    main()
