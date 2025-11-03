const fs = require('fs');
const path = require('path');

// Simple badge SVG generator
function generateBadge(label, value, color) {
  const labelWidth = label.length * 7 + 10;
  const valueWidth = value.length * 7 + 10;
  const totalWidth = labelWidth + valueWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="a">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </mask>
  <g mask="url(#a)">
    <path fill="#555" d="M0 0h${labelWidth}v20H0z"/>
    <path fill="${color}" d="M${labelWidth} 0h${valueWidth}v20H${labelWidth}z"/>
    <path fill="url(#b)" d="M0 0h${totalWidth}v20H0z"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelWidth / 2}" y="14">${label}</text>
    <text x="${labelWidth + valueWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${value}</text>
  </g>
</svg>`;
}

// Read coverage summary
const coveragePath = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');

if (!fs.existsSync(coveragePath)) {
  console.error('Coverage summary not found. Run tests first.');
  process.exit(1);
}

const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
const totalCoverage = coverage.total;

// Calculate average coverage
const statements = totalCoverage.statements.pct;
const branches = totalCoverage.branches.pct;
const functions = totalCoverage.functions.pct;
const lines = totalCoverage.lines.pct;

const avgCoverage = Math.round((statements + branches + functions + lines) / 4);

// Determine color
let color = '#e05d44'; // red
if (avgCoverage >= 80) color = '#44cc11'; // bright green
else if (avgCoverage >= 60) color = '#dfb317'; // yellow
else if (avgCoverage >= 40) color = '#fe7d37'; // orange

// Generate badge
const badge = generateBadge('coverage', `${avgCoverage}%`, color);

// Save badge
const badgePath = path.join(__dirname, '..', '..', 'badges', 'frontend-coverage.svg');
const badgeDir = path.dirname(badgePath);

if (!fs.existsSync(badgeDir)) {
  fs.mkdirSync(badgeDir, { recursive: true });
}

fs.writeFileSync(badgePath, badge);
console.log(`Frontend coverage badge generated: ${avgCoverage}%`);
console.log(`  Statements: ${statements}%`);
console.log(`  Branches: ${branches}%`);
console.log(`  Functions: ${functions}%`);
console.log(`  Lines: ${lines}%`);
