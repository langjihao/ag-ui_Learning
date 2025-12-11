
import { ChatOpenAI } from "@langchain/openai";
import fs from 'fs';
import path from 'path';

// Load .env manually
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (key && value && !key.startsWith('#')) {
        process.env[key] = value;
      }
    }
  });
}

console.log('Testing model configuration...');
console.log('MODEL:', process.env.MODEL);
console.log('OPENAI_API_BASE_URL:', process.env.OPENAI_API_BASE_URL);
// Mask API key
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '***' + process.env.OPENAI_API_KEY.slice(-4) : 'NOT SET');

async function testModel() {
  try {
    const model = new ChatOpenAI({
      modelName: process.env.MODEL,
      openAIApiKey: process.env.OPENAI_API_KEY,
      configuration: {
        baseURL: process.env.OPENAI_API_BASE_URL?.trim(),
      },
      temperature: 0,
    });

    console.log('Sending request to model...');
    const response = await model.invoke("Hello, are you working?");
    console.log('Response received:');
    console.log(response.content);
    console.log('Model configuration is VALID.');
  } catch (error) {
    console.error('Error testing model:', error);
  }
}

testModel();
