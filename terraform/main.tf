terraform {
  backend "gcs" {
    bucket  = "rewire-it-tfstate"
    prefix  = "terraform/state"
  }
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# 1. Enable necessary Google APIs
resource "google_project_service" "iam" {
  service = "iam.googleapis.com"
}

resource "google_project_service" "cloudresourcemanager" {
  service = "cloudresourcemanager.googleapis.com"
}

resource "google_project_service" "iamcredentials" {
  service = "iamcredentials.googleapis.com"
}

resource "google_project_service" "storage" {
  service = "storage.googleapis.com"
}

# 2. Create the GCS bucket
resource "google_storage_bucket" "website_bucket" {
  name          = var.project_id # Using project ID for the bucket name for uniqueness
  location      = var.gcp_location
  force_destroy = false # Set to true if you want to delete buckets with content

  uniform_bucket_level_access = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }
}

# 3. Create a Service Account for GitHub Actions
resource "google_service_account" "github_actions_sa" {
  account_id   = "github-actions-sa"
  display_name = "GitHub Actions Service Account"
}

# 4. Create a Workload Identity Pool
resource "google_iam_workload_identity_pool" "github_pool" {
  project                   = var.project_id
  workload_identity_pool_id = "github-actions-pool"
  display_name              = "GitHub Workload Identity Pool"
}

# 5. Create a Workload Identity Provider for the specific GitHub repo
resource "google_iam_workload_identity_pool_provider" "github_provider" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  display_name                       = "GitHub Actions Provider"
  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
  }
  attribute_condition = "attribute.repository == '${var.github_repo}'"
  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# 6. Allow the GitHub provider to impersonate the service account
resource "google_service_account_iam_member" "workload_identity_user" {
  service_account_id = google_service_account.github_actions_sa.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_pool.name}/attribute.repository/${var.github_repo}"
}

# 7. Grant the Service Account permissions to manage the GCS bucket
resource "google_storage_bucket_iam_member" "storage_admin" {
  bucket = google_storage_bucket.website_bucket.name
  role   = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.github_actions_sa.email}"
}

# 8. Grant public read access to all objects in the bucket
resource "google_storage_bucket_iam_member" "public_access" {
  bucket = google_storage_bucket.website_bucket.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# 9. Allow the service account to create access tokens for itself
resource "google_service_account_iam_member" "token_creator_self" {
  service_account_id = google_service_account.github_actions_sa.name
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:${google_service_account.github_actions_sa.email}"
} 