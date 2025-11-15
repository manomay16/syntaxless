from http.server import BaseHTTPRequestHandler
import json
import sys
from io import StringIO
import contextlib
import traceback
import threading

def handler(request):
    try:
        # Get the request body
        body = request.get_json()
        
        # Validate request
        if not body or 'code' not in body:
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
                    'output': 'No code provided in request'
                })
            }

        # Get code and input
        code = body['code']
        user_input = body.get('input', '')
        timeout_seconds = 10  # 10 second timeout for infinite loop detection

        # Create a safe execution environment
        output = StringIO()
        error = StringIO()
        
        # Use threading to implement timeout
        execution_result = {'completed': False, 'output': '', 'error': None}
        
        def execute_code():
            try:
                namespace = {}
                
                # Redirect stdout and stderr
                with contextlib.redirect_stdout(output), contextlib.redirect_stderr(error):
                    # Execute the code
                    exec(code, namespace)
                    
                    # If there's user input, handle it
                    if user_input:
                        # Split input into lines
                        input_lines = user_input.split('\n')
                        input_index = 0
                        
                        # Override input() function
                        def custom_input(prompt=''):
                            nonlocal input_index
                            if input_index < len(input_lines):
                                value = input_lines[input_index]
                                input_index += 1
                                return value
                            return ''
                        
                        # Replace built-in input with our custom one
                        namespace['input'] = custom_input
                        
                        # Re-execute the code with input handling
                        exec(code, namespace)
                
                execution_result['completed'] = True
                execution_result['output'] = output.getvalue()
            except Exception as e:
                execution_result['completed'] = True
                execution_result['error'] = f"{error.getvalue()}\n{traceback.format_exc()}"
        
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
            success = False
            output_text = execution_result['error']
        else:
            success = True
            output_text = execution_result['output']

        # Send response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({
                'success': success,
                'output': output_text
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
                'output': str(e)
            })
        }
