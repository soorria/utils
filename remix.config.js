/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  serverBuildTarget: 'vercel',
  // When running locally in development mode, we use the built in remix
  // server. This does not understand the vercel lambda module format,
  // so we default back to the standard build output.
  server: process.env.NODE_ENV === 'development' ? undefined : './server.js',
  ignoredRouteFiles: ['.*'],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "api/index.js",
  // publicPath: "/build/",
  // devServerPort: 8002
  serverDependenciesToBundle: [
    '@zag-js/dialog',
    '@zag-js/react',
    '@zag-js/aria-hidden',
    '@zag-js/tooltip',
    '@zag-js/core',
    '@zag-js/store',
    '@zag-js/dismissable',
    '@zag-js/interact-outside',
    '@zag-js/editable',
    '@zag-js/remove-scroll',
    '@zag-js/types',
  ],
}
