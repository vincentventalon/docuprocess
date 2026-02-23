import nextra from 'nextra'

const withNextra = nextra({
  contentDirBasePath: '/docs'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Add your www to non-www redirect here:
      // {
      //   source: '/:path*',
      //   has: [{ type: 'host', value: 'www.example.com' }],
      //   destination: 'https://example.com/:path*',
      //   permanent: true,
      // },
      {
        source: '/generators/free-invoice-generator',
        destination: '/generators/free-online-invoice-generator',
        permanent: true,
      },
      {
        source: '/generators/free-certificate-generator',
        destination: '/generators/free-online-certificate-maker',
        permanent: true,
      },
      {
        source: '/generators/free-packing-slip-generator',
        destination: '/generators/free-online-packing-slip-generator',
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'logos-world.net',
      },
      // Add your Supabase project hostname here:
      // {
      //   protocol: 'https',
      //   hostname: 'your-project.supabase.co',
      // },
    ],
  },
  webpack: (config, { webpack, isServer }) => {
    // Ignore MongoDB's optional dependencies to prevent build warnings
    if (isServer) {
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(kerberos|@mongodb-js\/zstd|@aws-sdk\/credential-providers|gcp-metadata|snappy|socks|aws4|mongodb-client-encryption)$/,
        })
      )
    }

    return config
  },
}

export default withNextra(nextConfig)
