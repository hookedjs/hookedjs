import { exportJWK,generateKeyPair } from 'jose'

// In an async function
const {publicKey, privateKey} = await generateKeyPair('PS256')
const publicJwk = await exportJWK(publicKey)
const privateJwk = await exportJWK(privateKey)
console.log({publicJwk, privateJwk})