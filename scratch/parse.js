const fs = require('fs');
const html = fs.readFileSync('/tmp/page.html', 'utf8');
const regex = /Metro Shawarma/g;
console.log('Matches for Metro Shawarma:', (html.match(regex) || []).length);
const req = /Minimum Requirements/g;
console.log('Matches for Minimum Requirements:', (html.match(req) || []).length);
const loc = /Branch Locations/g;
console.log('Matches for Branch Locations:', (html.match(loc) || []).length);
