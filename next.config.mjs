/** @type {import('next').NextConfig} */

const bucketName = 'rewire-it';

// The assetPrefix is the full URL prefix for your assets.
// This is needed for assets to load correctly from GCS.
const assetPrefix = `https://storage.googleapis.com/${bucketName}`;

const nextConfig = {
  /**
   * Enables static export for the app.
   * This generates a completely static site in the 'out' folder,
   * which can be deployed to any static hosting service like Google Cloud Storage.
   * @see https://nextjs.org/docs/app/building-your-application/deploying/static-exports
   */
  output: 'export',
  trailingSlash: true,
  assetPrefix: assetPrefix,
};

export default nextConfig;
