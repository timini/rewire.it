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

resource "google_project_service" "compute" {
  service = "compute.googleapis.com"
}

# 2. Create the GCS bucket for the website content
# This bucket is now private and serves content through the Load Balancer.
resource "google_storage_bucket" "website_bucket" {
  name                        = var.project_id
  location                    = var.gcp_location
  force_destroy               = true # Be cautious with this in production
  uniform_bucket_level_access = true
}

# 3. Create a Service Account for GitHub Actions
resource "google_service_account" "github_actions_sa" {
  account_id   = "github-actions-sa"
  display_name = "GitHub Actions Service Account"
}

# 4. Create Workload Identity Federation for GitHub Actions
resource "google_iam_workload_identity_pool" "github_pool" {
  workload_identity_pool_id = "github-actions-pool"
  display_name              = "GitHub Workload Identity Pool"
}

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

# 5. Grant permissions for the Service Account
# Allow GitHub Actions to impersonate the service account
resource "google_service_account_iam_member" "workload_identity_user" {
  service_account_id = google_service_account.github_actions_sa.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_pool.name}/attribute.repository/${var.github_repo}"
}

# Grant the Service Account permissions to upload to the GCS bucket
resource "google_storage_bucket_iam_member" "storage_admin" {
  bucket = google_storage_bucket.website_bucket.name
  role   = "roles/storage.objectAdmin" # More specific role than storage.admin
  member = "serviceAccount:${google_service_account.github_actions_sa.email}"
}

# Grant the Service Account permissions to create its own tokens
resource "google_service_account_iam_member" "token_creator_self" {
  service_account_id = google_service_account.github_actions_sa.name
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:${google_service_account.github_actions_sa.email}"
}

# --- Global Load Balancer and CDN ---

# 6. Create a backend bucket for the Load Balancer
resource "google_compute_backend_bucket" "website_backend" {
  name        = "${var.project_id}-backend-bucket"
  bucket_name = google_storage_bucket.website_bucket.name
  enable_cdn  = true
  depends_on = [
    google_project_service.compute
  ]
}

# 7. Create a URL map to route all traffic to the backend bucket
resource "google_compute_url_map" "default" {
  name            = "${var.project_id}-url-map"
  default_service = google_compute_backend_bucket.website_backend.id
}

# 8. Create an HTTP proxy to route requests to the URL map
resource "google_compute_target_http_proxy" "default" {
  name    = "${var.project_id}-http-proxy"
  url_map = google_compute_url_map.default.id
}

# 9. Create a global forwarding rule to handle and forward incoming requests
resource "google_compute_global_forwarding_rule" "default" {
  name       = "${var.project_id}-forwarding-rule"
  target     = google_compute_target_http_proxy.default.id
  port_range = "80"
} 