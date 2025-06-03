from http.server import BaseHTTPRequestHandler
import json
import sys
import io
from contextlib import redirect_stdout, redirect_stderr
import os

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            if not data.get('code'):
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': False,
                    'output': 'No code provided'
                }).encode())
                return

            # Capture stdout and stderr
            stdout = io.StringIO()
            stderr = io.StringIO()
            
            try:
                # Create a custom input function that returns empty string
                def custom_input(prompt=""):
                    print(prompt, end='', file=stdout)
                    return ""
                
                # Create a namespace with our custom input function
                namespace = {
                    'input': custom_input,
                    '__builtins__': __builtins__
                }
                
                with redirect_stdout(stdout), redirect_stderr(stderr):
                    # Execute the code with our custom namespace
                    exec(data['code'], namespace)
                
                output = stdout.getvalue() or stderr.getvalue()
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': True,
                    'output': output
                }).encode())
            except Exception as e:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': False,
                    'output': str(e)
                }).encode())
                
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': False,
                'output': 'Internal server error'
            }).encode())

if __name__ == '__main__':
    from http.server import HTTPServer
    port = int(os.environ.get('PORT', 3001))
    server = HTTPServer(('localhost', port), handler)
    print(f'Starting server on port {port}...')
    server.serve_forever() 