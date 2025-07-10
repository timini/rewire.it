#!/bin/bash
# This script sets the required GitHub secrets from Terraform outputs.
# It requires the gh CLI to be installed and authenticated.

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Fetching Terraform outputs..."
# Use `terraform output -raw` to prevent quotes around the values.
BUCKET_NAME=$(terraform output -raw gcp_bucket_name)
SERVICE_ACCOUNT_EMAIL=$(terraform output -raw gcp_service_account_email)
PROJECT_ID=$(terraform output -raw gcp_project_id)
POOL_ID=$(terraform output -raw gcp_workload_identity_pool_id)
PROVIDER_ID=$(terraform output -raw gcp_workload_identity_provider_id)

echo "Setting GitHub secrets..."

gh secret set GCP_BUCKET_NAME --body "$BUCKET_NAME"
gh secret set GCP_SERVICE_ACCOUNT_EMAIL --body "$SERVICE_ACCOUNT_EMAIL"
gh secret set GCP_PROJECT_ID --body "$PROJECT_ID"
gh secret set GCP_WORKLOAD_IDENTITY_POOL_ID --body "$POOL_ID"
gh secret set GCP_WORKLOAD_IDENTITY_PROVIDER_ID --body "$PROVIDER_ID"

# Remove the old, unused secret
echo "Removing old GCP_WORKLOAD_IDENTITY_PROVIDER secret..."
gh secret remove GCP_WORKLOAD_IDENTITY_PROVIDER || echo "Secret not found, skipping."

echo "✅ All secrets set successfully!" 