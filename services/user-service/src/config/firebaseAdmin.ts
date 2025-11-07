import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'

// Two supported ways to provide credentials:
// 1) FIREBASE_CREDENTIALS -> path to serviceAccountKey.json (relative to project root)
// 2) FIREBASE_CREDENTIALS_JSON -> base64-encoded JSON string (useful for CI / secrets)
// If neither is provided and the app runs on GCP, the SDK will use Application Default Credentials.

function loadServiceAccount() {
  const credPath = process.env.FIREBASE_CREDENTIALS || ''
  const credBase64 = process.env.FIREBASE_CREDENTIALS_JSON || ''

  if (credBase64) {
    try {
      const json = Buffer.from(credBase64, 'base64').toString('utf8')
      return JSON.parse(json)
    } catch (err) {
      throw new Error('Invalid FIREBASE_CREDENTIALS_JSON: ' + (err as Error).message)
    }
  }

  if (credPath) {
    const p = path.isAbsolute(credPath) ? credPath : path.join(process.cwd(), credPath)
    if (!fs.existsSync(p)) throw new Error(`Service account file not found at ${p}`)
    const raw = fs.readFileSync(p, 'utf8')
    return JSON.parse(raw)
  }

  return null
}

const serviceAccount = loadServiceAccount()

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  })
} else {
  // No explicit credentials provided: rely on Google Application Default Credentials
  // (works when running on GCP services with proper service account attached)
  admin.initializeApp()
}

export default admin
