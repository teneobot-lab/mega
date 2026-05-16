const fs = require('fs');
const path = require('path');

function getFiles(dir, files_) {
  files_ = files_ || [];
  const files = fs.readdirSync(dir);
  for (let i in files) {
    const name = dir + '/' + files[i];
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files_);
    } else {
      if(name.endsWith('.tsx') || name.endsWith('.ts')) {
         files_.push(name);
      }
    }
  }
  return files_;
}

const files = getFiles('src/pages');
let issues = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Check for map used in JSX without key near the tag (heuristic)
    if (line.includes('.map') && line.includes('=>') && line.includes('<') && !line.includes('key={') && !line.includes('key=')) {
      issues.push({file, line: index + 1, problem: 'Missing key prop in map', text: line.trim()});
    }
  });
});

fs.writeFileSync('audit-map.json', JSON.stringify(issues, null, 2));
