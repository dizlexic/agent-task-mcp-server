import { $fetch } from 'ofetch';

async function testCreateTag() {
  const email = `test-${Date.now()}@example.com`;
  const password = 'password123';
  const name = 'Test User';

  // 1. Register
  const regResponse = await $fetch.raw('http://localhost:3000/api/auth/register', {
    method: 'POST',
    body: { email, password, name }
  });
  const cookie = regResponse.headers.get('set-cookie');

  // 2. Login
  const loginResponse = await $fetch.raw('http://localhost:3000/api/auth/login', {
    method: 'POST',
    body: { email, password },
    headers: { cookie }
  });
  const cookie2 = loginResponse.headers.get('set-cookie') || cookie;

  // 3. Create a board to get a boardId
  const board = await $fetch('http://localhost:3000/api/boards', {
    method: 'POST',
    body: { name: 'Test Board' },
    headers: { cookie: cookie2 }
  });
  console.log('Board created:', board);

  // 4. Try to create a tag
  try {
    const tag = await $fetch(`http://localhost:3000/api/boards/${board.id}/tags`, {
      method: 'POST',
      body: { name: 'New Tag', color: '#ff0000', icon: '🚀' },
      headers: { cookie: cookie2 }
    });
    console.log('Tag created:', tag);
  } catch (e) {
    console.error('Create tag failed:', e.data);
  }
}

testCreateTag();
