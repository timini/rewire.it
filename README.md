# rewire.it - Personal Blog & Portfolio

This is the repository for my personal website, [rewire.it](https://rewire.it). It's built with Next.js and Tailwind CSS, and deployed as a static site to Google Cloud Storage using a modern Infrastructure-as-Code approach with Terraform and GitHub Actions.

## Infrastructure and Deployment

This project uses a sophisticated CI/CD pipeline for automated, secure, and repeatable deployments. The entire cloud infrastructure is managed declaratively using Terraform.

### Key Components

- **Next.js & Tailwind CSS**: For the frontend application.
- **Google Cloud Storage (GCS)**: For hosting the static website.
- **Terraform**: For defining and managing the GCS bucket, IAM roles, and Workload Identity Federation.
- **GitHub Actions**: For orchestrating the CI/CD pipeline (build, test, deploy).
- **Workload Identity Federation**: For secure, keyless authentication between GitHub Actions and Google Cloud.

### Deployment Workflow

1.  **Push to `main`**: Any push to the `main` branch automatically triggers the `Build and Deploy to GCS` GitHub Actions workflow.
2.  **Build**: The workflow checks out the code, installs dependencies, and builds the Next.js application into a static site (`/out` directory).
3.  **Authenticate**: It securely authenticates to Google Cloud using Workload Identity Federation. No long-lived service account keys are used.
4.  **Deploy**: The contents of the `/out` directory are synchronized with the GCS bucket.
5.  **Summary**: A summary with a link to the live site is posted to the GitHub Actions run.

### Initial Setup (First-Time Deployment)

To deploy this project to a new Google Cloud project, you need to perform a one-time setup to provision the infrastructure and configure the necessary secrets in GitHub.

**Prerequisites:**

1.  A Google Cloud Platform (GCP) project.
2.  The `gcloud` CLI installed and authenticated (`gcloud auth login`).
3.  The Terraform CLI installed.
4.  The GitHub CLI (`gh`) installed and authenticated (`gh auth login`).

**Steps:**

1.  **Navigate to the Terraform directory:**
    ```bash
    cd terraform
    ```

2.  **Initialize Terraform:**
    ```bash
    terraform init
    ```

3.  **Apply the Terraform configuration:**
    This step will provision the GCS bucket, the service account, and the Workload Identity Pool and Provider in your GCP project. You will be prompted to enter your GCP `project_id` and your GitHub repository name (`owner/repo`).
    ```bash
    terraform apply
    ```

4.  **Set the GitHub Secrets:**
    Once the infrastructure is provisioned, run the provided script to set the required secrets in your GitHub repository. These secrets are used by the GitHub Actions workflow to authenticate with GCP and identify the GCS bucket.
    ```bash
    ./set-github-secrets.sh
    ```

After completing these steps, your infrastructure is ready, and the CI/CD pipeline is fully configured. All subsequent pushes to the `main` branch will automatically deploy to your GCS bucket.

## Getting Started with Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
