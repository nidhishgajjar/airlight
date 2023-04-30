const { notarize } = require('electron-notarize');

async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  console.log('Notarizing:', appName);

  await notarize({
    appBundleId: 'ai.constitute.chad',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
  });

  console.log('Notarization completed.');
}

exports.default = notarizing;
