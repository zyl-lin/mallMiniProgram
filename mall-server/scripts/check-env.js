const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '..', '.env.development');

console.log('Checking environment configuration...');
console.log('Environment file path:', envPath);

if (fs.existsSync(envPath)) {
  console.log('File exists');
  
  const fileContent = fs.readFileSync(envPath, 'utf8');
  console.log('\nFile content:');
  console.log(fileContent);
  
  const parsedEnv = dotenv.parse(fileContent);
  console.log('\nParsed environment variables:');
  console.log(parsedEnv);
} else {
  console.log('File does not exist!');
} 