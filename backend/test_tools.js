const { calculateProbability, analyzePattern, calculateReturn } = require('./tools');

console.log('--- Testing tools.js ---');

console.log('\nProbability (45):', calculateProbability('45'));
console.log('\nPattern (11):', analyzePattern('11'));
console.log('\nCalculate Return (100 FC):', calculateReturn('100', 'direct'));
console.log('\nCalculate Return (50 Ending):', calculateReturn('50', 'ending'));
