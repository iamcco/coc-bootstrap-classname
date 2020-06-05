/* eslint-disable @typescript-eslint/no-var-requires */
const https = require('https');
const fs = require('fs');
const path = require('path');

const classNamePattern = /\.[0-9a-zA-Z_-]+/g;

const classNames = new Set();

function resolveClassNames(data) {
  const lines = data.split(/\r\n|\n/);
  lines.slice(6).forEach(line => {
    line = line.trim();
    if ((!line.endsWith('{') && !line.endsWith(',')) || line.startsWith('@') || line.endsWith(';')) {
      return;
    }
    const list = line.match(classNamePattern);
    if (list) {
      Array.from(list).forEach(cn => {
        classNames.add(cn.slice(1));
      });
    }
  });
  fs.writeFileSync(path.join(__dirname, '..', 'classNames.json'), JSON.stringify(Array.from(classNames)));
}

https.get('https://raw.githubusercontent.com/twbs/bootstrap/master/dist/css/bootstrap.css', res => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    resolveClassNames(data);
  });
});
