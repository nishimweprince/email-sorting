const fs = require('fs');
const path = require('path');
const { makeBadge } = require('badge-maker');

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

// Determine color based on coverage percentage
let color = 'red';
if (avgCoverage >= 80) color = 'brightgreen';
else if (avgCoverage >= 60) color = 'yellow';
else if (avgCoverage >= 40) color = 'orange';

// Generate badge
const badge = makeBadge({
  label: 'coverage',
  message: `${avgCoverage}%`,
  color: color,
});

// Save badge
const badgePath = path.join(__dirname, '..', '..', 'badges', 'backend-coverage.svg');
const badgeDir = path.dirname(badgePath);

if (!fs.existsSync(badgeDir)) {
  fs.mkdirSync(badgeDir, { recursive: true });
}

fs.writeFileSync(badgePath, badge);
console.log(`Backend coverage badge generated: ${avgCoverage}%`);
console.log(`  Statements: ${statements}%`);
console.log(`  Branches: ${branches}%`);
console.log(`  Functions: ${functions}%`);
console.log(`  Lines: ${lines}%`);
