#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const projectPath = path.join(__dirname, '..', 'ios', 'App', 'App.xcodeproj', 'project.pbxproj');
const entitlementPath = path.join(__dirname, '..', 'ios', 'App', 'App', 'App.entitlements');
if (!fs.existsSync(projectPath)) throw new Error('iOS project not found. Run npx cap add ios and npx cap sync ios first.');

fs.writeFileSync(entitlementPath, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.developer.game-center</key>
  <true/>
</dict>
</plist>
`);

let project = fs.readFileSync(projectPath, 'utf8');
if (!project.includes('CODE_SIGN_ENTITLEMENTS = App/App.entitlements;')) {
  project = project.replace(
    /(PRODUCT_BUNDLE_IDENTIFIER = com\.paulus\.laststandcommand;)/g,
    '$1\n\t\t\t\tCODE_SIGN_ENTITLEMENTS = App/App.entitlements;'
  );
}
fs.writeFileSync(projectPath, project);
console.log('Game Center entitlement configured for the App target.');
