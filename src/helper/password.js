import bcrypt from 'bcrypt';

export async function hashPassword(password)
{
    const SALT_ROUNDS = 10;
    return  await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password,hashedPassword) {
    let result = false
    try {
        const validPassword = await bcrypt.compare(password, hashedPassword);
        result = !!validPassword
    } catch (e) {

    }
    return result
}
