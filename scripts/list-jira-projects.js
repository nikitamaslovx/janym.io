const { Buffer } = require('node:buffer');
const https = require('node:https');

const domain = 'janym.atlassian.net';
const email = process.env.JIRA_EMAIL || '';
const apiToken = process.env.JIRA_API_TOKEN || '';

const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');

const options = {
  hostname: domain,
  port: 443,
  path: '/rest/api/3/project',
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
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const projects = JSON.parse(data);
        const projectList = Array.isArray(projects) ? projects : projects.values || [];
        console.log(`Found ${projectList.length} projects.`);
        projectList.forEach(p => console.log(`- Key: ${p.key}, Name: ${p.name}, ID: ${p.id}`));
      } catch (e) {
        console.error('JSON Parse Error:', e);
      }
    } else {
      console.error(`Error: ${res.statusCode}`);
    }
  });
});

req.on('error', e => console.error(e));
req.end();
