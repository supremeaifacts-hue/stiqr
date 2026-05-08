// backend/index.js - Zero dependencies version
const http = require('http');

// In-memory storage
const users = [];

// Helper to send JSON responses
function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  const url = req.url;
  
  // GET /auth/status
  if (url === '/auth/status' && req.method === 'GET') {
    sendJson(res, 200, { authenticated: false });
    return;
  }
  
  // POST /auth/signup
  if (url === '/auth/signup' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { email, password, name } = JSON.parse(body);
        
        console.log('Signup attempt:', email);
        
        if (!email || !password) {
          sendJson(res, 400, { error: 'Email and password required' });
          return;
        }
        
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
          sendJson(res, 400, { error: 'User already exists' });
          return;
        }
        
        const newUser = { email, password, name: name || email.split('@')[0] };
        users.push(newUser);
        
        sendJson(res, 201, { success: true, message: 'User created successfully', email });
      } catch (error) {
        sendJson(res, 500, { error: 'Invalid request' });
      }
    });
    return;
  }
  
  // POST /auth/login
  if (url === '/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
          sendJson(res, 401, { error: 'Invalid email or password' });
          return;
        }
        
        sendJson(res, 200, { success: true, user: { email: user.email, name: user.name } });
      } catch (error) {
        sendJson(res, 500, { error: 'Invalid request' });
      }
    });
    return;
  }
  
  // 404 for anything else
  sendJson(res, 404, { error: 'Not found' });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});