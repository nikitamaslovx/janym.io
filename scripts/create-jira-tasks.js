const { Buffer } = require('node:buffer');
const https = require('node:https');
const fs = require('node:fs');

const domain = 'janym.atlassian.net';
const email = process.env.JIRA_EMAIL || '';
const apiToken = process.env.JIRA_API_TOKEN || '';
const projectKey = 'JI';

const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');

// Parse task.md
const taskFile = fs.readFileSync('/Users/timing/.gemini/antigravity/brain/dfa52251-9f5d-4bd7-8f42-5d904de90fab/task.md', 'utf8');
const lines = taskFile.split('\n');

const tasks = [];
let currentEpoch = '';

lines.forEach((line) => {
  if (line.trim().startsWith('## ')) {
    currentEpoch = line.trim().replace('## ', '');
  } else if (line.trim().startsWith('- [ ]') || line.trim().startsWith('- [/]')) {
    const taskName = line.replace('- [ ]', '').replace('- [/]', '').trim();
    const cleanName = taskName.replace(/<!--.*?-->/g, '').trim();

    if (cleanName && !cleanName.startsWith('**')) {
      tasks.push({
        summary: cleanName,
        description: `Epoch: ${currentEpoch}. Created automatically from Janym.io task list.`,
      });
    }
  }
});

console.log(`Found ${tasks.length} tasks to create.`);

const createIssue = (task) => {
  return new Promise((resolve) => {
    const bodyData = JSON.stringify({
      fields: {
        project: { key: projectKey },
        summary: task.summary,
        description: {
          type: 'doc',
          version: 1,
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: task.description }],
          }],
        },
        issuetype: { name: 'Task' },
      },
    });

    const options = {
      hostname: domain,
      port: 443,
      path: '/rest/api/3/issue',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const result = JSON.parse(data);
          console.log(`Created issue ${result.key}: ${task.summary}`);
          resolve(result);
        } else {
          console.error(`Failed to create issue: ${res.statusCode}`);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`Request error: ${e.message}`);
      resolve(null);
    });

    req.write(bodyData);
    req.end();
  });
};

const processTasks = async () => {
  for (const task of tasks) {
    await createIssue(task);
  }
};

processTasks();
