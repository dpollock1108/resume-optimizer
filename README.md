# Resume Optimizer

A private web app that tailors resumes to job postings using Claude. The production setup runs the React frontend and FastAPI backend as one Cloud Run service protected by Google Cloud Identity-Aware Proxy (IAP). Profiles and application history are stored per user in Firestore.

For the GitHub Actions CI/CD workflow and guided setup, see [`docs/CI_CD.md`](docs/CI_CD.md).

## Security model

- IAP requires an explicitly authorized Google account before any request reaches Cloud Run.
- FastAPI verifies IAP's signed JWT on application and API requests as defense in depth.
- Firestore data is stored under `users/{iap_subject}` so each signed-in user has an isolated data subtree.
- The Anthropic key is supplied from Secret Manager and never exposed to the browser.
- AI request fields have server-side size limits. Cloud Run should also have a maximum instance count to cap unexpected spend.
- Each running instance applies a best-effort per-user AI limit, defaulting to 10 requests per hour. Provider-level spend limits remain the authoritative cost control.

## Local development

### 1. Backend

Use Python 3.10 or newer and authenticate Application Default Credentials against the GCP project containing your development Firestore database.

```bash
gcloud auth application-default login
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Set `ANTHROPIC_API_KEY` and `GOOGLE_CLOUD_PROJECT` in `backend/.env`, then start the API:

```bash
uvicorn main:app --reload --port 8000
```

`APP_ENV=development` uses the local identity configured by `DEV_USER_ID` and `DEV_USER_EMAIL`. The production image always sets `APP_ENV=production`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. Vite proxies `/api` to the backend.

On the first successful authenticated load, legacy `ro_profiles` and `ro_applications` data is copied from browser storage into the current user's Firestore records. The local copies are removed only after migration completes.

## GCP deployment

The following uses `us-west1`; choose another region if appropriate. Firestore and Cloud Run should generally use the same region.

### 1. Set project values

```bash
export PROJECT_ID="your-project-id"
export REGION="us-west1"
export SERVICE_NAME="resume-optimizer"
export SERVICE_ACCOUNT="resume-optimizer-runtime"
export OWNER_EMAIL="your-google-account@example.com"
gcloud config set project "$PROJECT_ID"
export PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
export IAP_AUDIENCE="/projects/${PROJECT_NUMBER}/locations/${REGION}/services/${SERVICE_NAME}"
```

Enable the required APIs:

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com firestore.googleapis.com secretmanager.googleapis.com iap.googleapis.com
```

### 2. Create Firestore and the runtime identity

Create a Firestore database in Native mode from the Google Cloud console. Use the default database and select the same region as Cloud Run.

```bash
gcloud iam service-accounts create "$SERVICE_ACCOUNT" --display-name="Resume Optimizer runtime"
gcloud projects add-iam-policy-binding "$PROJECT_ID" --member="serviceAccount:${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com" --role="roles/datastore.user"
```

The server-side Firestore client uses IAM. Do not create permissive client-side Firestore rules; the browser never connects to Firestore directly.

### 3. Store the Anthropic key

Create the secret without putting the key in shell history:

```bash
gcloud secrets create anthropic-api-key --replication-policy=automatic
gcloud secrets versions add anthropic-api-key --data-file=-
gcloud secrets add-iam-policy-binding anthropic-api-key --member="serviceAccount:${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
```

The second command waits for the key on standard input. Paste it, then press `Ctrl-D`.

### 4. Deploy behind IAP

For a project without a Google Workspace organization, the first IAP setup should be completed in the Cloud Run console so Google can create the external OAuth client. Deploy the service, select **Require authentication**, and choose **Identity-Aware Proxy (IAP)**.

The equivalent deployment command is:

```bash
gcloud run deploy "$SERVICE_NAME" --source . --region="$REGION" --service-account="${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com" --no-allow-unauthenticated --iap --set-env-vars="APP_ENV=production,IAP_AUDIENCE=${IAP_AUDIENCE},AI_REQUESTS_PER_HOUR=10,LEGACY_MIGRATION_EMAIL=${OWNER_EMAIL},LEGACY_MIGRATION_USER_ID=local-user" --set-secrets="ANTHROPIC_API_KEY=anthropic-api-key:latest" --max-instances=3
```

Grant IAP permission to invoke the service:

```bash
gcloud run services add-iam-policy-binding "$SERVICE_NAME" --region="$REGION" --member="serviceAccount:service-${PROJECT_NUMBER}@gcp-sa-iap.iam.gserviceaccount.com" --role="roles/run.invoker"
```

### 5. Allow friends

For each Google account that should have access:

```bash
gcloud iap web add-iam-policy-binding --member="user:friend@example.com" --role="roles/iap.httpsResourceAccessor" --region="$REGION" --resource-type=cloud-run --service="$SERVICE_NAME"
```

Remove access with the corresponding `gcloud iap web remove-iam-policy-binding` command.

### 6. Finish the local-data migration

Sign in once using the Google account in `OWNER_EMAIL`. The backend copies the records created under the local development identity to that account's signed IAP identity, then removes the `local-user` records. After confirming the profile appears, remove the one-time migration settings:

```bash
gcloud run services update "$SERVICE_NAME" --region="$REGION" --remove-env-vars="LEGACY_MIGRATION_EMAIL,LEGACY_MIGRATION_USER_ID"
```

## Operational safeguards

- Configure a small GCP budget with email alerts.
- Configure Anthropic workspace spend limits if available for the API key's workspace.
- Keep Cloud Run `--max-instances` low until usage patterns are known.
- Avoid logging request bodies because resumes and job applications contain personal information.
- Establish a retention policy and delete user data when access is removed.
