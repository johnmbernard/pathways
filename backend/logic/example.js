// Example logic module
// Import and use in routes with: import { exampleLogic } from '../logic/example.js';

export function exampleLogic(input) {
  console.log('Running exampleLogic with:', input);
  return {
    result: 'success',
    data: input,
    timestamp: new Date().toISOString(),
  };
}

export function validateInput(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid input');
  }
  return true;
}
