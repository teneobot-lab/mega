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
    // 2. React mapping without key (naïve) - skip files that are not rendering maps or already have key 
    // This regex is tricky. Let's just do a simpler search.
    if (line.includes('.map(') && line.includes('=>') && line.includes('<') && !line.includes('key=')) {
        if (!line.includes('key={') && !line.includes('key={`')) {
            // Some keys are on the next line. We'll skip if the next line has a key
            if (index < lines.length - 1 && lines[index+1].includes('key=')) {
               // ignore
            } else {
                issues.push(`FILE: ${file}, LINE: ${index+1}, PROBLEM: Missing key prop in map, FIX: Add a unique key prop to the root element returned by map`);
            }
        }
    }

    // 3. Null access on response data
    if (line.match(/(res|data|response)\.[a-zA-Z0-9_]+\.map/) && !line.includes('?')) {
       issues.push(`FILE: ${file}, LINE: ${index+1}, PROBLEM: Missing optional chaining before .map, FIX: Use optional chaining or default array (e.g., data.foo?.map or (data.foo || []).map)`);
    }
  });
});

console.log(issues.join('\n'));
