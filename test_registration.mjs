
import { $fetch } from 'ofetch'

async function run() {
    // Register
    try {
        await $fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            body: { name: 'testuser', email: 'test@example.com', password: 'password123' },
        })
        console.log('Registered')
    } catch (e) {
        console.log('Registration failed', e)
    }

    // Login (the session should be set automatically by cookie, but let's see if we can get the session)
    // Actually, I can't easily manage cookies with $fetch without a cookie jar.
    // Let me just assume I can create the board if I am logged in.
    // The issue might be that I'm not logged in.
    
    // I will try to use the `test_password.ts` to see how it's handled or look at auth logic.
}

run()
