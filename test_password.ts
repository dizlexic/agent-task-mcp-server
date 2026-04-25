import { hashPassword, comparePasswords } from './server/utils/password';

const runTest = async () => {
    const password = 'mySecretPassword';
    const hash = await hashPassword(password);
    console.log('Hash:', hash);
    const isMatch = await comparePasswords(password, hash);
    console.log('Match:', isMatch);
    const isNoMatch = await comparePasswords('wrongPassword', hash);
    console.log('No Match:', !isNoMatch);
};

runTest();
