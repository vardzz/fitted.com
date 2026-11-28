const { extractProfileRuleBased } = require('./rule-extractor');
const fs = require('fs');
const testCode = fs.readFileSync('C:/Users/PC/.gemini/antigravity/brain/d21da33b-1dcb-4262-a308-99898cabe6d2/scratch/test-parser.js', 'utf8');
const cvIdx = testCode.indexOf('Jericho F. Varde');
const cv = testCode.slice(cvIdx, testCode.indexOf('`;', cvIdx));
const profile = extractProfileRuleBased(cv);

console.log('=== SKILLS ===');
console.log(profile.skills);
console.log('=== EXPERIENCE ===');
console.log(profile.experience.map(e => ({ role: e.role, org: e.org, start: e.start, end: e.end, bullets: e.bullets })));
console.log('=== PROJECTS ===');
console.log(profile.projects.map(p => ({ name: p.name, role: p.role, tech: p.tech, bullets: p.bullets })));
console.log('=== EDUCATION ===');
console.log(profile.education);
console.log('=== CERTS ===');
console.log(profile.certifications);
