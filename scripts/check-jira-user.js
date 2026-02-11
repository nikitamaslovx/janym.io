const { Buffer } = require('node:buffer');
const https = require('node:https');

const domain = 'janym.atlassian.net';
const email = process.env.JIRA_EMAIL || '';
const apiToken = process.env.JIRA_API_TOKEN || '';

const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');

const options = {
  hostname: domain,
  port: 443,
  path: '/rest/api/3/myself',
  method: 'GET',
  headers: {
    Authorization: `Basic ${auth}`,
    Accept: 'application/json',
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data.substring(0, 500));
  });
});

req.on('error', e => console.error(e));
req.end();
