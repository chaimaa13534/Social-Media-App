/**
 * Creates simple placeholder images for default-avatar.png and default-banner.jpg
 * Run once: node database/create-placeholders.js
 */
const fs   = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '../client/assets/uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Minimal valid 1x1 grey PNG (base64)
const PNG_1x1_GREY = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

const avatarPath = path.join(uploadsDir, 'default-avatar.png');
const bannerPath = path.join(uploadsDir, 'default-banner.jpg');

if (!fs.existsSync(avatarPath)) { fs.writeFileSync(avatarPath, PNG_1x1_GREY); console.log('Created default-avatar.png'); }
if (!fs.existsSync(bannerPath)) { fs.writeFileSync(bannerPath, PNG_1x1_GREY); console.log('Created default-banner.jpg');  }

console.log('Placeholder images ready.');
