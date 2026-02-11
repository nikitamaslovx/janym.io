const { Buffer } = require('node:buffer');
const https = require('node:https');

const domain = 'janym.atlassian.net';
const email = process.env.JIRA_EMAIL || '';
const apiToken = process.env.JIRA_API_TOKEN || '';
const projectId = '10000';

const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');

const options = {
  hostname: domain,
  port: 443,
  path: `/rest/api/3/project/${projectId}`,
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
      const project = JSON.parse(data);
      console.log('Project Issue Types:');
      project.issueTypes.forEach((it) => {
        console.log(`- ID: ${it.id}, Name: ${it.name}, Subtask: ${it.subtask}`);
      });
    } else {
      console.error(`Error: ${res.statusCode}`);
    }
  });
});

req.on('error', e => console.error(e));
req.end();
