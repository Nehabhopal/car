import http.server
import socketserver
import sys

PORT = 3000
for p in [3000, 8000, 8080, 5500, 5173]:
    try:
        httpd = socketserver.TCPServer(("", p), http.server.SimpleHTTPRequestHandler)
        PORT = p
        break
    except OSError:
        continue

print(f"NOCTIS server is running at http://localhost:{PORT}")
sys.stdout.flush()
httpd.serve_forever()
