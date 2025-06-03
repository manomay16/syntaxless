const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Start the Python serverless function
const pythonProcess = spawn('python', ['api/run.py'], {
  env: {
    ...process.env,
    VERCEL_ENV: 'production',
    VERCEL_URL: 'http://localhost:3001'
  }
});

pythonProcess.stdout.on('data', (data) => {
  console.log('Python stdout:', data.toString());
});

pythonProcess.stderr.on('data', (data) => {
  console.error('Python stderr:', data.toString());
});

// Create a simple HTTP server to handle requests
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/run') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Received code:', data.code);
        
        // Forward to Python process
        const pythonRequest = http.request({
          hostname: 'localhost',
          port: 3001,
          path: '/api/run',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }, (pythonResponse) => {
          let responseData = '';
          pythonResponse.on('data', chunk => {
            responseData += chunk;
          });
          pythonResponse.on('end', () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(responseData);
          });
        });

        pythonRequest.on('error', (error) => {
          console.error('Error forwarding to Python:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, output: 'Error forwarding to Python' }));
        });

        pythonRequest.write(JSON.stringify(data));
        pythonRequest.end();
      } catch (error) {
        console.error('Error parsing request:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, output: 'Invalid request' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(3001, () => {
  console.log('Test server running at http://localhost:3001');
  console.log('Send POST requests to http://localhost:3001/api/run');
  console.log('Example:');
  console.log('curl -X POST -H "Content-Type: application/json" -d \'{"code":"print(\'Hello, World!\')"}\' http://localhost:3001/api/run');
}); 