import crypto from 'crypto'

export const hashToken = (token) =>
    crypto.createHash('sha256').update(token).digest('hex')

export const PBKDF2_ITERATIONS = Number(process.env.PBKDF2_ITERATIONS) || 150_000
const PBKDF2_DIGEST = 'sha256'
const PBKDF2_KEYLEN = 32

export const hashPassword = async (password, salt, iterations) =>
    new Promise((resolve, reject) => {
        crypto.pbkdf2(
            password,
            salt,
            iterations,
            PBKDF2_KEYLEN,
            PBKDF2_DIGEST,
            (err, derivedKey) => {
                if (err) return reject(err)
                resolve(derivedKey.toString('hex'))
            },
        )
    })

export const timingSafeEqualHex = (a, b) => {
    try {
        return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))
    } catch {
        return false
    }
}
