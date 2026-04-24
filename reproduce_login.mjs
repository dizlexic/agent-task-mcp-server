import { $fetch } from 'ofetch';

async function testLogin() {
  const email = `test-${Date.now()}@example.com`;
  const password = 'password123';
  const name = 'Test User';

  console.log('Registering user...');
  try {
    await $fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: { email, password, name }
    });
    console.log('User registered.');
  } catch (e) {
    console.error('Registration failed:', e);
    return;
  }

  console.log('Logging in...');
  try {
    const response = await $fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    console.log('Login successful:', response);
  } catch (e) {
    console.error('Login failed:', e);
  }
}

testLogin();
