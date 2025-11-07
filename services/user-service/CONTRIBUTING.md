Firebase admin credentials

You need a service account JSON to allow this service to verify Firebase ID tokens.

Options to provide credentials to the service:

1) Local file path
- Download a service account JSON from the Firebase Console (Project Settings -> Service accounts -> Generate new private key).
- Save it outside version control, e.g. `secrets/serviceAccountKey.json`.
- Set `FIREBASE_CREDENTIALS=./secrets/serviceAccountKey.json` in your `.env`.

2) Environment variable (CI / production)
- Base64 encode the JSON and set it in `FIREBASE_CREDENTIALS_JSON` env var.
  - Unix example: `cat serviceAccountKey.json | base64 | pbcopy`
- The service will decode and use it at runtime.

3) Google Cloud (recommended for GCP deployments)
- If running on Cloud Run / GKE with a service account attached, the SDK can use Application Default Credentials and no key is required.

Security notes:
- Never commit service account keys to git.
- Use secret managers (GCP Secret Manager) or environment variables in CI/CD.
