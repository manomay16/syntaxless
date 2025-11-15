from http.server import BaseHTTPRequestHandler
import json
import sys
from io import StringIO
import contextlib
import traceback

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

        # Create a safe execution environment
        output = StringIO()
        error = StringIO()

        # Redirect stdout and stderr
        with contextlib.redirect_stdout(output), contextlib.redirect_stderr(error):
            try:
                # Create a new namespace for execution
                namespace = {}
                
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
                
                success = True
                output_text = output.getvalue()
            except Exception as e:
                success = False
                output_text = f"{error.getvalue()}\n{traceback.format_exc()}"

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
