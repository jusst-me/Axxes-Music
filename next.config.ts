import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  images: {
    /*
     * Album art comes from the iTunes Search API, which serves it from a numbered set of hosts. Only
     * the image path is allowed, so the entry cannot be turned into a proxy for anything else there.
     */
    remotePatterns: [
      { protocol: 'https', hostname: '*.mzstatic.com', pathname: '/image/**' },
    ],
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
