const http = require('http');
const url = require('url');
const port = process.env.PORT || 3000;
const environment = process.env.NODE_ENV || 'development';

// --- Enhanced Web Server ---
const server = http.createServer((req, res) => {
  const timestamp = new Date().toISOString();
  const { pathname } = url.parse(req.url, true);
  
  console.log(`${timestamp} - ${req.method} ${pathname} - ${req.headers['user-agent']}`);

  // CORS headers for better browser compatibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Route handling
  switch (pathname) {
    case '/':
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>DevOps Lab 2025</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
            .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007bff; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>I'm Getting Better at DevOps, Yay!</h1>
            <p>Modern Node.js application with CI/CD pipeline</p>
          </div>
          <h2>Available Endpoints:</h2>
          <div class="endpoint">
            <strong>GET /</strong> - This welcome page
          </div>
          <div class="endpoint">
            <strong>GET /health</strong> - Health check (JSON)
          </div>
          <div class="endpoint">
            <strong>GET /info</strong> - System information
          </div>
          <p>Environment: <strong>${environment}</strong></p>
          <p>Server time: <strong>${timestamp}</strong></p>
        </body>
        </html>
      `);
      break;

    case '/health':
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: environment,
        version: '1.0.0',
        node_version: process.version
      }, null, 2));
      break;

    case '/info':
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        platform: process.platform,
        architecture: process.arch,
        node_version: process.version,
        memory_usage: process.memoryUsage(),
        environment: environment,
        pid: process.pid
      }, null, 2));
      break;

    default:
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Not Found',
        message: `Route ${pathname} not found`,
        timestamp: new Date().toISOString()
      }, null, 2));
  }
});

// --- Graceful Shutdown ---
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// --- Run App Normally ---
if (process.argv[2] !== 'test') {
  server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}/`);
    console.log(`Environment: ${environment}`);
    console.log(`Node.js version: ${process.version}`);
  });
}

// --- Enhanced Testing ---
if (process.argv[2] === 'test') {
  const assert = require('assert');
  console.log('🧪 Running tests...');

  // Test 1: Basic math
  try {
    assert.strictEqual(2 + 2, 4, 'Math test failed');
    console.log('✅ Math test passed');
  } catch (err) {
    console.error('❌ Math test failed:', err.message);
    process.exit(1);
  }

  // Test 2: Health endpoint
  server.listen(0, () => {
    const addr = server.address();
    const testUrl = `http://localhost:${addr.port}/health`;
    
    http.get(testUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          assert.strictEqual(res.statusCode, 200, 'Health endpoint should return 200');
          assert.strictEqual(json.status, 'healthy', 'Health status should be healthy');
          assert(json.timestamp, 'Should have timestamp');
          assert(typeof json.uptime === 'number', 'Uptime should be a number');
          console.log('✅ Health endpoint test passed');
          
          // Test 3: Info endpoint
          const infoUrl = `http://localhost:${addr.port}/info`;
          http.get(infoUrl, (res2) => {
            let data2 = '';
            res2.on('data', chunk => data2 += chunk);
            res2.on('end', () => {
              try {
                const json2 = JSON.parse(data2);
                assert.strictEqual(res2.statusCode, 200, 'Info endpoint should return 200');
                assert(json2.platform, 'Should have platform info');
                console.log('✅ Info endpoint test passed');
                console.log('🎉 All tests passed successfully!');
                server.close();
                process.exit(0);
              } catch (err) {
                console.error('❌ Info endpoint test failed:', err.message);
                server.close();
                process.exit(1);
              }
            });
          });
        } catch (err) {
          console.error('❌ Health endpoint test failed:', err.message);
          server.close();
          process.exit(1);
        }
      });
    }).on('error', (err) => {
      console.error('❌ HTTP request failed:', err.message);
      server.close();
      process.exit(1);
    });
  });
}
