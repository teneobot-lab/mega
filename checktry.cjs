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
      if(name.endsWith('.ts')) {
         files_.push(name);
      }
    }
  }
  return files_;
}

const files = getFiles('src/server');

let missingTryCatch = false;

for (let file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  let inRoute = false;
  let braceCount = 0;
  let hasTry = false;
  let routeLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.match(/async\s*\(req[^)]*\)\s*=>/)) {
       inRoute = true;
       hasTry = false;
       braceCount = 0;
       routeLine = i + 1;
    }

    if (inRoute) {
      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;

      if (line.includes('try {') || line.includes('try{')) {
         hasTry = true;
      }

      if (braceCount === 0) {
         inRoute = false;
         if (!hasTry) {
           console.log("Missing try-catch in " + file + " for route starting at line " + routeLine);
           missingTryCatch = true;
         }
      }
    }
  }
}

if(!missingTryCatch) {
  console.log("All routes seem to have a try/catch");
}
