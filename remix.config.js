/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  serverBuildTarget: 'vercel',
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
  serverModuleFormat: 'esm',
}
