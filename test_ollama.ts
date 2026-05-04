import { generateResponse } from './server/utils/ollama';

async function test() {
  try {
    const response = await generateResponse('Hello, how are you?');
    console.log('Response:', response);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
