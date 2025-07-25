// Docker 헬스체크 스크립트
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/health',
  method: 'GET',
  timeout: 5000,
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Health check passed');
    process.exit(0);
  } else {
    console.log(`❌ Health check failed with status: ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('timeout', () => {
  console.log('❌ Health check timed out');
  req.destroy();
  process.exit(1);
});

req.on('error', (err) => {
  console.log(`❌ Health check error: ${err.message}`);
  process.exit(1);
});

req.end();