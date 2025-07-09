#!/bin/bash

# This script sets the necessary secrets for the GitHub Actions workflow.
# It reads the outputs from the Terraform state and sets them as secrets in the GitHub repository.
#
# Prerequisites:
# 1. You must have the GitHub CLI ('gh') installed.
# 2. You must be authenticated with the GitHub CLI ('gh auth login').
# 3. You must run this script from the 'terraform' directory.

set -e # Exit immediately if a command exits with a non-zero status.

# --- Sanity Checks ---

echo "INFO: Checking prerequisites..."

# Check if run from the 'terraform' directory
if [ ! -f "main.tf" ]; then
  echo "ERROR: This script must be run from the 'terraform' directory." >&2
  exit 1
fi

# Check if 'gh' is installed
if ! command -v gh &> /dev/null; then
    echo "ERROR: GitHub CLI (gh) could not be found. Please install it to continue." >&2
    echo "See: https://github.com/cli/cli#installation" >&2
    exit 1
fi

# Check if logged into 'gh'
if ! gh auth status &> /dev/null; then
    echo "ERROR: You are not logged into the GitHub CLI. Please run 'gh auth login' and follow the prompts." >&2
    exit 1
fi

echo "INFO: Prerequisites met."

# --- Get Repository Info ---

echo "INFO: Identifying GitHub repository..."
# Get the repository name (e.g., 'owner/repo') from the current git context
REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner')
if [ -z "$REPO" ]; then
    echo "ERROR: Could not determine the GitHub repository." >&2
    echo "Please ensure you are inside a Git repository with a GitHub remote." >&2
    exit 1
fi
echo "INFO: Found repository: $REPO"

# --- Main Logic ---

# Function to set a secret in the identified GitHub repository
set_secret() {
  local secret_name="$1"
  local secret_value="$2"
  echo "INFO: Setting secret '$secret_name'..."
  # Use --body to read the secret value from standard input for robustness
  echo -n "$secret_value" | gh secret set "$secret_name" --repo "$REPO" --body -
  if [ $? -eq 0 ]; then
    echo "SUCCESS: Secret '$secret_name' set successfully."
  else
    echo "ERROR: Failed to set secret '$secret_name'." >&2
    # The 'set -e' at the top will cause the script to exit here
  fi
}

echo "INFO: Retrieving values from Terraform outputs..."

GCP_WORKLOAD_IDENTITY_PROVIDER=$(terraform output -raw gcp_workload_identity_provider)
GCP_SERVICE_ACCOUNT_EMAIL=$(terraform output -raw gcp_service_account_email)
GCP_BUCKET_NAME=$(terraform output -raw gcp_bucket_name)

# --- Set Secrets ---

set_secret "GCP_WORKLOAD_IDENTITY_PROVIDER" "$GCP_WORKLOAD_IDENTITY_PROVIDER"
set_secret "GCP_SERVICE_ACCOUNT_EMAIL" "$GCP_SERVICE_ACCOUNT_EMAIL"
set_secret "GCP_BUCKET_NAME" "$GCP_BUCKET_NAME"

echo ""
echo "✅ All secrets have been set successfully in the '$REPO' repository." 