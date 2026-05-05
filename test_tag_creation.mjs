
import { $fetch } from 'ofetch';

// Note: This script assumes the server is running.
// If it's not, I can't really test the API.
// But I can at least structure the test.

async function test() {
  const boardId = 'vteYPDXLCCcU'; // From the task I saw earlier
  const baseUrl = 'http://localhost:3000'; // Assuming default port

  try {
    // 1. Create a tag
    const newTag = await $fetch(`${baseUrl}/api/boards/${boardId}/tags`, {
      method: 'POST',
      body: { name: 'Test Tag', color: '#ff0000', icon: '🚀' }
    });
    console.log('Created tag:', newTag);

    // 2. Delete the tag
    await $fetch(`${baseUrl}/api/boards/${boardId}/tags/${newTag.id}`, {
      method: 'DELETE'
    });
    console.log('Deleted tag');

  } catch (e) {
    console.error('Error:', e);
  }
}

test();
