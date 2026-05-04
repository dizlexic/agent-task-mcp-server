import { sendEmail } from '../server/utils/mailer.ts';

async function test() {
  console.log('Sending test email...');
  const result = await sendEmail('test@example.com', 'Test Subject', 'Test Body');
  console.log('Result:', result);
}

test();
