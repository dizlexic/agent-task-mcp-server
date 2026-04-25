import { getVerificationEmail, getPasswordResetEmail } from './server/utils/email-templates';

const verif = getVerificationEmail('https://mootasks.dev/verify/123');
console.log('Verification Email:', verif.subject);
console.log('Verification HTML:', verif.html);

const reset = getPasswordResetEmail('https://mootasks.dev/reset/456');
console.log('Reset Email:', reset.subject);
console.log('Reset HTML:', reset.html);
