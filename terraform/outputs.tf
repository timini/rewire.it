output "gcp_bucket_name" {
  description = "The name of the GCS bucket created."
  value       = google_storage_bucket.website_bucket.name
}

output "gcp_service_account_email" {
  description = "The email of the created GCP Service Account."
  value       = google_service_account.github_actions_sa.email
}

output "gcp_workload_identity_provider" {
  description = "The full name of the Workload Identity Provider."
  value       = google_iam_workload_identity_pool_provider.github_provider.name
} 