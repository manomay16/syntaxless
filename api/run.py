from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import sys
import io
from contextlib import redirect_stdout, redirect_stderr
import os
import threading

# Vercel serverless function handler
def handler(request):
    try:
        # Get the request body - Vercel passes it as a dict with 'body' key
        if isinstance(request, dict):
            body_str = request.get('body', '{}')
            if isinstance(body_str, str):
                data = json.loads(body_str)
            else:
                data = body_str
        elif hasattr(request, 'get_json'):
            data = request.get_json()
        else:
            data = request.json() if hasattr(request, 'json') else {}
        
        if not data.get('code'):
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                'body': json.dumps({
                    'success': False,
                    'output': 'No code provided'
                })
            }

        # Get inputs from the request (handle both input and inputs fields)
        inputs = []
        if 'input' in data:
            inputs = data['input'].split('\n')
        elif 'inputs' in data:
            inputs = data['inputs']
        
        timeout_seconds = 10  # 10 second timeout for infinite loop detection
        
        # Use threading to implement timeout
        execution_result = {'completed': False, 'output': '', 'error': None}
        input_index = [0]  # Use a list to maintain state between input() calls
        
        def execute_code():
            try:
                # Capture stdout and stderr
                stdout = io.StringIO()
                stderr = io.StringIO()
                
                # Create a custom input function that uses the provided inputs
                def custom_input(prompt=""):
                    print(prompt, end='', file=stdout)
                    if input_index[0] < len(inputs):
                        value = inputs[input_index[0]]
                        input_index[0] += 1
                        print(value, file=stdout)  # Echo the input
                        return value
                    return ""
                
                # Create a namespace with our custom input function
                namespace = {
                    'input': custom_input,
                    '__builtins__': __builtins__
                }
                
                with redirect_stdout(stdout), redirect_stderr(stderr):
                    # Execute the code with our custom namespace
                    exec(data['code'], namespace)
                
                execution_result['completed'] = True
                execution_result['output'] = stdout.getvalue() or stderr.getvalue()
            except Exception as e:
                execution_result['completed'] = True
                execution_result['error'] = str(e)
        
        # Run code in a thread
        thread = threading.Thread(target=execute_code)
        thread.daemon = True
        thread.start()
        thread.join(timeout=timeout_seconds)
        
        # Check if execution timed out
        if thread.is_alive():
            # Code is still running - likely infinite loop
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                'body': json.dumps({
                    'success': False,
                    'output': (
                        '⚠️ Execution Timeout - Possible Infinite Loop\n\n'
                        'Your code ran for more than 10 seconds without completing.\n\n'
                        'This usually means you have an infinite loop (a loop that never stops).\n\n'
                        'Common causes:\n'
                        '• while True: without a break statement\n'
                        '• A loop condition that never becomes False\n'
                        '• Missing increment/decrement in a loop counter\n\n'
                        '💡 Tips to fix:\n'
                        '• Add a break statement to exit the loop\n'
                        '• Make sure your loop condition can become False\n'
                        '• Add a counter to prevent infinite loops\n'
                        '• Use range() for loops that need to run a specific number of times'
                    ),
                    'timeout': True
                })
            }
        
        # Execution completed (or errored)
        if execution_result['error']:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                'body': json.dumps({
                    'success': False,
                    'output': execution_result['error']
                })
            }
        else:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                'body': json.dumps({
                    'success': True,
                    'output': execution_result['output']
                })
            }
                
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({
                'success': False,
                'output': 'Internal server error'
            })
        }

# Local development server (for running with python api/run.py)
class LocalHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Create a mock request object for the handler
            class MockRequest:
                def __init__(self, body_data):
                    self._body = json.dumps(body_data)
                
                def get_json(self):
                    return json.loads(self._body)
            
            result = handler(MockRequest(data))
            
            # Convert result to HTTP response
            self.send_response(result['statusCode'])
            for key, value in result['headers'].items():
                self.send_header(key, value)
            self.end_headers()
            self.wfile.write(result['body'].encode())
                
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': False,
                'output': 'Internal server error'
            }).encode())

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3001))
    server = HTTPServer(('localhost', port), LocalHandler)
    print(f'Starting server on port {port}...')
    server.serve_forever()
