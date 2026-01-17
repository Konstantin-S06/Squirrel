/**
 * Test script for Canvas API Client
 * 
 * Usage:
 *   CANVAS_API_TOKEN=your-token npm run test-canvas
 * 
 * Or set in .env file:
 *   CANVAS_API_TOKEN=your-token
 */

require('dotenv').config();

// This is a Node.js script, so we need to use require syntax
// In a real TypeScript project, you'd compile this or use ts-node

async function testCanvasClient() {
  try {
    console.log('🚀 Testing Canvas API Client...\n');

    // Check if token is set
    const apiToken = process.env.CANVAS_API_TOKEN;
    if (!apiToken) {
      console.error('❌ CANVAS_API_TOKEN environment variable is not set');
      console.error('   Set it in your .env file or run:');
      console.error('   CANVAS_API_TOKEN=your-token npm run test-canvas');
      process.exit(1);
    }

    console.log('✅ API Token found\n');

    // Note: In a Node.js environment, you'd compile the TypeScript first
    // For now, this is just an example of how to use it
    console.log('📝 Example usage:');
    console.log(`
import { createCanvasClientFromEnv } from './src/services/canvasClient';

const client = createCanvasClientFromEnv();

// Test connection
const isConnected = await client.testConnection();
if (!isConnected) {
  throw new Error('Failed to connect to Canvas API');
}

// Fetch courses
const courses = await client.fetchCourses();
console.log('Active courses:', courses.length);

// Fetch submissions for first course
if (courses.length > 0) {
  const submissions = await client.fetchCourseSubmissions(courses[0].id);
  console.log('Submissions:', submissions.length);
}
    `);

    console.log('\n📚 See src/examples/canvasUsageExample.ts for complete examples\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testCanvasClient();
