import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pg', 'mysql2', 'mssql', 'tedious', '@libsql/client'],
};

export default withNextIntl(nextConfig);
