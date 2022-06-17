import {exportJWK, generateKeyPair} from 'jose'

main()

async function main() {
  const {publicKey, privateKey} = await generateKeyPair('PS256')
  const publicJwk = await exportJWK(publicKey)
  const privateJwk = await exportJWK(privateKey)
  console.log({publicJwk, privateJwk})
}
