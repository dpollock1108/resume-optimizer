# CI/CD Learning Guide

This project uses GitHub Actions to test every proposed change and deploy every accepted change to Google Cloud Run.

## The delivery flow

```text
feature branch -> pull request -> test/build gates -> review -> merge to main
                                                              |
                                                              v
                                      build Docker image tagged with commit SHA
                                                              |
                                                              v
                                               push to Artifact Registry
                                                              |
                                                              v
                                          deploy exact image to Cloud Run
```

The pipeline is defined in `.github/workflows/pipeline.yml`.

## What CI and CD mean here

**Continuous Integration (CI)** runs on pull requests and pushes to `main`:

1. Start clean GitHub-hosted Linux runners.
2. Install dependencies from lock files.
3. Lint and compile the React frontend.
4. Run backend unit and security tests with Python 3.12.
5. Stop immediately if any quality gate fails.

**Continuous Delivery/Deployment (CD)** runs only after CI passes on `main`:

1. Exchange GitHub's short-lived OIDC token for short-lived GCP credentials.
2. Build the production Dockerfile.
3. Tag the image with the Git commit SHA, making the artifact traceable and immutable.
4. Push that image to Artifact Registry.
5. Point Cloud Run at that exact image.

No long-lived GCP service-account key is stored in GitHub. Workload Identity Federation trusts only workflows from `dpollock1108/resume-optimizer`.

## One-time application bootstrap

The deployment pipeline updates an existing Cloud Run service; it does not own foundational infrastructure. Complete the main README through the first manual Cloud Run/IAP deployment before enabling automatic deployments. This establishes:

- the runtime service account used by the application;
- the Anthropic secret and its IAM policy;
- Firestore access;
- Cloud Run environment variables and instance limits;
- the first-time external IAP OAuth configuration and user allowlist.

That separation is common in production: infrastructure code or an administrator creates the platform, while the delivery pipeline releases application versions onto it.

## One-time pipeline bootstrap

Run these commands after the runtime service and first manual deployment exist.

### 1. Set names

```bash
export PROJECT_ID="resume-optimizer-500204"
export PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
export REGION="us-west1"
export GITHUB_REPOSITORY="dpollock1108/resume-optimizer"
export ARTIFACT_REPOSITORY="resume-optimizer"
export DEPLOY_SERVICE_ACCOUNT="github-deployer"
export RUNTIME_SERVICE_ACCOUNT="resume-optimizer-runtime"
export WORKLOAD_POOL="github-actions"
export WORKLOAD_PROVIDER="github"
```

### 2. Enable federation APIs and create the image repository

```bash
gcloud services enable iamcredentials.googleapis.com sts.googleapis.com --project="$PROJECT_ID"

gcloud artifacts repositories create "$ARTIFACT_REPOSITORY" \
  --project="$PROJECT_ID" \
  --location="$REGION" \
  --repository-format=docker \
  --description="Resume Optimizer release images"
```

### 3. Create a least-privilege deployment identity

```bash
gcloud iam service-accounts create "$DEPLOY_SERVICE_ACCOUNT" \
  --project="$PROJECT_ID" \
  --display-name="GitHub deployment pipeline"

export DEPLOY_SERVICE_ACCOUNT_EMAIL="${DEPLOY_SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com"
export RUNTIME_SERVICE_ACCOUNT_EMAIL="${RUNTIME_SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${DEPLOY_SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/run.developer"

gcloud artifacts repositories add-iam-policy-binding "$ARTIFACT_REPOSITORY" \
  --project="$PROJECT_ID" \
  --location="$REGION" \
  --member="serviceAccount:${DEPLOY_SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/artifactregistry.writer"

gcloud iam service-accounts add-iam-policy-binding "$RUNTIME_SERVICE_ACCOUNT_EMAIL" \
  --project="$PROJECT_ID" \
  --member="serviceAccount:${DEPLOY_SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/iam.serviceAccountUser"
```

The deployment account can publish images and update Cloud Run. It cannot read Firestore or the Anthropic secret. The runtime account can use those resources but cannot deploy code.

### 4. Trust only this GitHub repository

```bash
gcloud iam workload-identity-pools create "$WORKLOAD_POOL" \
  --project="$PROJECT_ID" \
  --location=global \
  --display-name="GitHub Actions"

gcloud iam workload-identity-pools providers create-oidc "$WORKLOAD_PROVIDER" \
  --project="$PROJECT_ID" \
  --location=global \
  --workload-identity-pool="$WORKLOAD_POOL" \
  --display-name="GitHub repository provider" \
  --issuer-uri="https://token.actions.githubusercontent.com/" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository=='${GITHUB_REPOSITORY}'"

gcloud iam service-accounts add-iam-policy-binding "$DEPLOY_SERVICE_ACCOUNT_EMAIL" \
  --project="$PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${WORKLOAD_POOL}/attribute.repository/${GITHUB_REPOSITORY}"
```

### 5. Configure GitHub repository variables

Get the provider's full resource name:

```bash
export WORKLOAD_IDENTITY_PROVIDER="$(gcloud iam workload-identity-pools providers describe "$WORKLOAD_PROVIDER" \
  --project="$PROJECT_ID" \
  --location=global \
  --workload-identity-pool="$WORKLOAD_POOL" \
  --format='value(name)')"
```

In GitHub, open **Settings -> Secrets and variables -> Actions -> Variables** and create:

| Variable | Value |
| --- | --- |
| `GCP_PROJECT_ID` | `resume-optimizer-500204` |
| `GCP_REGION` | `us-west1` |
| `GCP_ARTIFACT_REPOSITORY` | `resume-optimizer` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | output of `$WORKLOAD_IDENTITY_PROVIDER` |
| `GCP_DEPLOY_SERVICE_ACCOUNT` | output of `$DEPLOY_SERVICE_ACCOUNT_EMAIL` |
| `CLOUD_RUN_SERVICE` | `resume-optimizer` |

These values identify resources but grant no access by themselves, so they are repository variables rather than secrets.

Create a GitHub environment named `production`. Optionally add required reviewers to turn continuous deployment into continuous delivery with a manual approval gate.

## First pipeline run

1. Create a feature branch.
2. Make a small change and push it.
3. Open a pull request into `main`.
4. Inspect the `Test and build` job and deliberately observe each quality gate.
5. Merge only after CI passes.
6. Watch `Build image and deploy` authenticate, publish the SHA-tagged image, and update Cloud Run.
7. In Artifact Registry, find the image tag matching the merge commit SHA.
8. In Cloud Run revisions, find the revision using that same image digest.

## Interview concepts to practice

- **Pipeline:** the ordered automation from source change to production release.
- **Runner:** the temporary machine executing a workflow job.
- **Quality gate:** a required check that prevents bad code from moving forward.
- **Artifact:** the built container image; build once, deploy the same artifact.
- **Immutable tag:** the Git SHA identifies exactly which source produced an image.
- **OIDC federation:** short-lived identity exchange instead of stored cloud keys.
- **Least privilege:** CI deploys; runtime reads application data and secrets.
- **Environment:** a deployment target with optional approvals and protection rules.
- **Rollback:** redeploy a previously known-good image digest or SHA tag.
- **Traceability:** commit, workflow run, image, and Cloud Run revision can be correlated.

## Rollback exercise

List recent image tags, choose a known-good SHA, and deploy it:

```bash
gcloud artifacts docker images list \
  "${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPOSITORY}/resume-optimizer" \
  --include-tags

gcloud run deploy resume-optimizer \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --image="${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPOSITORY}/resume-optimizer:KNOWN_GOOD_SHA"
```

Rollback is a new deployment of an old artifact; it does not rebuild source code.
