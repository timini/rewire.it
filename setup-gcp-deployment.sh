#!/bin/bash

# This script automates the setup of a Google Cloud Storage bucket and
# Workload Identity Federation for deploying a static site from GitHub Actions.

set -e # Exit immediately if a command exits with a non-zero status.

echo "### Step 1: Select your GCP Project ###"
echo "Fetching available Google Cloud projects..."
echo "If you don't see your project, make sure you are logged in ('gcloud auth login') and have the correct permissions."

# List projects and let the user choose
PROJECT_LIST=$(gcloud projects list --format="value(projectId)")
if [ -z "$PROJECT_LIST" ]; then
    echo "No GCP projects found. Please log in and try again."
    exit 1
fi

PS3="Please select the project to use: "
select GCP_PROJECT_ID in $PROJECT_LIST; do
    if [ -n "$GCP_PROJECT_ID" ]; then
        break
    else
        echo "Invalid selection. Please try again."
    fi
done

echo "Setting active project to: $GCP_PROJECT_ID"
gcloud config set project "$GCP_PROJECT_ID"
GCP_PROJECT_NUMBER=$(gcloud projects describe "$GCP_PROJECT_ID" --format="value(projectNumber)")
echo "Project Number: $GCP_PROJECT_NUMBER"
echo "--------------------------------------------------"

echo "### Step 2: Enable required Google Cloud APIs ###"
gcloud services enable \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  storage.googleapis.com \
  cloudresourcemanager.googleapis.com
echo "APIs enabled."
echo "--------------------------------------------------"

echo "### Step 3: Select or Create a Google Cloud Storage (GCS) Bucket ###"

# Get list of existing buckets
echo "Fetching existing GCS buckets..."
BUCKET_LIST_RAW=$(gcloud storage buckets list --project="$GCP_PROJECT_ID" --format="value(name)")
BUCKET_LIST=$(echo "$BUCKET_LIST_RAW" | sed 's|gs://||g')

# Add "Create a new bucket" as the first option
CREATE_NEW_OPTION="<<< Create a new bucket >>>"
if [ -z "$BUCKET_LIST" ]; then
    BUCKET_CHOICES=("$CREATE_NEW_OPTION")
else
    # BASH arrays are fun. This ensures the list is correctly parsed with spaces.
    read -r -a BUCKET_ARRAY <<< "$BUCKET_LIST"
    BUCKET_CHOICES=("$CREATE_NEW_OPTION" "${BUCKET_ARRAY[@]}")
fi

PS3="Please select an existing bucket or create a new one: "
select bucket_choice in "${BUCKET_CHOICES[@]}"; do
    if [[ "$bucket_choice" == "$CREATE_NEW_OPTION" ]]; then
        while true; do
            read -p "Enter a globally unique name for your new GCS bucket: " GCP_BUCKET_NAME
            if gcloud storage buckets describe "gs://$GCP_BUCKET_NAME" --project="$GCP_PROJECT_ID" > /dev/null 2>&1; then
                echo "Error: Bucket '$GCP_BUCKET_NAME' already exists. Please choose a different name."
            else
                GCS_BUCKET_LOCATION="US" # You can change this, e.g., "EU" or "ASIA"
                echo "Creating GCS bucket..."
                gcloud storage buckets create "gs://$GCP_BUCKET_NAME" --project="$GCP_PROJECT_ID" --default-storage-class=STANDARD --location="$GCS_BUCKET_LOCATION"
                break
            fi
        done
        break
    elif [ -n "$bucket_choice" ]; then
        GCP_BUCKET_NAME="$bucket_choice"
        echo "You selected existing bucket: $GCP_BUCKET_NAME"
        break
    else
        echo "Invalid selection. Please try again."
    fi
done

# This part runs regardless of whether the bucket was created or selected
echo "Configuring bucket for public website hosting..."
gcloud storage buckets add-iam-policy-binding "gs://$GCP_BUCKET_NAME" --member=allUsers --role=roles/storage.objectViewer
gcloud storage buckets update "gs://$GCP_BUCKET_NAME" --web-main-page-suffix=index.html --web-error-page=404.html
echo "Bucket '$GCP_BUCKET_NAME' is configured for public access."
echo "--------------------------------------------------"

echo "### Step 4: Create a Service Account ###"
SERVICE_ACCOUNT_NAME="github-deployer"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"

echo "Creating service account..."
if gcloud iam service-accounts describe "$SERVICE_ACCOUNT_EMAIL" --project="$GCP_PROJECT_ID" > /dev/null 2>&1; then
    echo "Service account '$SERVICE_ACCOUNT_NAME' already exists."
else
    gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" --project="$GCP_PROJECT_ID" --display-name="GitHub Deployer"
    echo "Waiting 15 seconds for service account to propagate before granting permissions..."
    sleep 15
fi

echo "Granting storage permissions to the service account..."
gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="roles/storage.admin"
echo "Service account configured."
echo "--------------------------------------------------"

echo "### Step 5: Set up Workload Identity Federation ###"
read -p "Enter your GitHub username (e.g., timini): " GITHUB_USERNAME

# Add input validation loop for the repository name
while true; do
    read -p "Enter your GitHub repository name (e.g., rewire.it): " GITHUB_REPO
    if [ -n "$GITHUB_REPO" ]; then
        break
    else
        echo "Repository name cannot be empty. Please try again."
    fi
done

IDENTITY_POOL_NAME="github-pool"
IDENTITY_PROVIDER_NAME="github-provider"

echo "Creating Workload Identity Pool..."
if gcloud iam workload-identity-pools describe "$IDENTITY_POOL_NAME" --project="$GCP_PROJECT_ID" --location="global" > /dev/null 2>&1; then
    echo "Workload Identity Pool '$IDENTITY_POOL_NAME' already exists."
else
    gcloud iam workload-identity-pools create "$IDENTITY_POOL_NAME" --project="$GCP_PROJECT_ID" --location="global" --display-name="GitHub Pool"
fi

WIF_POOL_ID=$(gcloud iam workload-identity-pools describe "$IDENTITY_POOL_NAME" --project="$GCP_PROJECT_ID" --location="global" --format="value(name)")

echo "Creating Workload Identity Provider..."
if gcloud iam workload-identity-pools providers describe "$IDENTITY_PROVIDER_NAME" --project="$GCP_PROJECT_ID" --location="global" --workload-identity-pool="$IDENTITY_POOL_NAME" > /dev/null 2>&1; then
    echo "Workload Identity Provider '$IDENTITY_PROVIDER_NAME' already exists."
else
    gcloud iam workload-identity-pools providers create-oidc "$IDENTITY_PROVIDER_NAME" \
        --project="$GCP_PROJECT_ID" \
        --location="global" \
        --workload-identity-pool="$IDENTITY_POOL_NAME" \
        --display-name="GitHub Provider" \
        --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
        --attribute-condition="assertion.repository == '${GITHUB_USERNAME}/${GITHUB_REPO}'" \
        --issuer-uri="https://token.actions.githubusercontent.com"
fi

WIF_PROVIDER_ID=$(gcloud iam workload-identity-pools providers describe "$IDENTITY_PROVIDER_NAME" --project="$GCP_PROJECT_ID" --location="global" --workload-identity-pool="$IDENTITY_POOL_NAME" --format="value(name)")

echo "Binding GitHub repository to the service account..."
gcloud iam service-accounts add-iam-policy-binding "$SERVICE_ACCOUNT_EMAIL" \
    --project="$GCP_PROJECT_ID" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principal://iam.googleapis.com/$WIF_POOL_ID/subject/repo:${GITHUB_USERNAME}/${GITHUB_REPO}:ref:refs/heads/main"

echo "Workload Identity Federation setup complete."
echo "--------------------------------------------------"
echo "✅ GCP setup is complete! ✅"
echo ""
echo "### Step 6: Add the following secrets to your GitHub repository ###"
echo "Go to: https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}/settings/secrets/actions"
echo ""
echo "1. Name: GCP_BUCKET_NAME"
echo "   Value: $GCP_BUCKET_NAME"
echo ""
echo "2. Name: GCP_SERVICE_ACCOUNT_EMAIL"
echo "   Value: $SERVICE_ACCOUNT_EMAIL"
echo ""
echo "3. Name: GCP_WORKLOAD_IDENTITY_PROVIDER"
echo "   Value: $WIF_PROVIDER_ID"
echo ""
echo "--------------------------------------------------" 