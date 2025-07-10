#!/bin/bash
# This script sets the required GitHub secrets from Terraform outputs.
# It requires the gh CLI to be installed and authenticated.

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Fetching Terraform outputs..."
# Use `terraform output -raw` to prevent quotes around the values.
BUCKET_NAME=$(terraform output -raw gcp_bucket_name)
SERVICE_ACCOUNT_EMAIL=$(terraform output -raw gcp_service_account_email)
WIF_PROVIDER=$(terraform output -raw gcp_workload_identity_provider)


echo "Setting GitHub secrets..."

gh secret set GCP_BUCKET_NAME --body "$BUCKET_NAME"
gh secret set GCP_SERVICE_ACCOUNT_EMAIL --body "$SERVICE_ACCOUNT_EMAIL"
gh secret set GCP_WORKLOAD_IDENTITY_PROVIDER --body "$WIF_PROVIDER"


# Remove the old, unused secrets
echo "Removing old granular secrets..."
gh secret remove GCP_PROJECT_ID || echo "Secret GCP_PROJECT_ID not found, skipping."
gh secret remove GCP_WORKLOAD_IDENTITY_POOL_ID || echo "Secret GCP_WORKLOAD_IDENTITY_POOL_ID not found, skipping."
gh secret remove GCP_WORKLOAD_IDENTITY_PROVIDER_ID || echo "Secret GCP_WORKLOAD_IDENTITY_PROVIDER_ID not found, skipping."


echo "✅ All secrets set successfully!" 