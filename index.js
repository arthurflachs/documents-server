const https = require('https');
const fs = require('fs');
const app = require('./server.js');

const credentials = {
  key: fs.readFileSync('./sslCert/server.key', 'utf8'),
  cert: fs.readFileSync('./sslCert/server.crt', 'utf8'),
};

https.createServer(credentials, app).listen(41414, () => console.log('Listening on port localhost:41414'));
