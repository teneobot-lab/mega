const fs = require('fs');

let file = 'src/pages/accounting/IncomeStatement.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/data\.revenues\.map/g, '(data?.revenues || []).map');
content = content.replace(/data\.expenses\.map/g, '(data?.expenses || []).map');
content = content.replace(/a\.balance\.toLocaleString\(\)/g, '(a.balance || 0).toLocaleString()');

fs.writeFileSync(file, content);

file = 'src/pages/accounting/Ledger.tsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/data\.entries\.map/g, '(data?.entries || []).map');
fs.writeFileSync(file, content);

file = 'src/pages/accounting/GeneralJournalForm.tsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/data\.Entries\.map/g, '(data?.Entries || []).map');
fs.writeFileSync(file, content);
