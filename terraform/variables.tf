variable "project_id" {
  description = "The GCP project ID to deploy resources into."
  type        = string
}

variable "region" {
  description = "The GCP region to deploy resources into."
  type        = string
  default     = "us-central1"
}

variable "gcp_location" {
  description = "The location for the GCS bucket (e.g., US-CENTRAL1, US)."
  type        = string
  default     = "US"
}

variable "github_repo" {
  description = "The GitHub repository in the format 'owner/repo'."
  type        = string
} 