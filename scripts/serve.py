"""Local server for the site, like `python3 -m http.server 8000`, but it tells the
browser to check for a newer version of every file before using its cached copy.
Unchanged files still come back as a fast "304 Not Modified".

Usage (from the project folder):  python3 scripts/serve.py [port]
"""
import http.server
import os
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
    print(f"Serving the site on http://localhost:{port} (Ctrl+C to stop)")
    # Only this computer can reach it (same as `--bind 127.0.0.1`).
    http.server.ThreadingHTTPServer(("127.0.0.1", port), NoCacheHandler).serve_forever()
