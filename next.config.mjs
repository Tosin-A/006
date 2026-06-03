/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint 9 / eslint-config-next circular ref at build time; linting done separately
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
