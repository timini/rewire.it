/** @type {import('next').NextConfig} */

const bucketName = process.env.GCP_BUCKET_NAME || 'rewire-it';
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  /**
   * Enables static export for the app.
   * This generates a completely static site in the 'out' folder,
   * which can be deployed to any static hosting service like Google Cloud Storage.
   * @see https://nextjs.org/docs/app/building-your-application/deploying/static-exports
   */
  output: 'export',
  trailingSlash: true,
  assetPrefix: isProd ? `https://storage.googleapis.com/${bucketName}` : undefined,
};

export default nextConfig;
