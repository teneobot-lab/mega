const fs = require('fs');

const services = fs.readFileSync('src/lib/api-services.ts', 'utf8');
const backendRoutes = [];

// Very naive scanner
const routeFiles = fs.readdirSync('src/server/routes').filter(f => f.endsWith('.ts'));
for(let file of routeFiles) {
    const code = fs.readFileSync('src/server/routes/' + file, 'utf8');
    const prefixMatch = /app\.use\("([^"]+)"/g; // Not parsing server.ts, hardcoding prefixes below
}

console.log("Analyzing...");
