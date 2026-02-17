/**
 * Personalized QR Code Generator for qr-app
 * Run with: node scripts/generate-personalized-qr.js
 */

const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// ===== CUSTOMIZE YOUR QR CODE HERE =====
const CONFIG = {
  // Content to encode (URL, text, email, etc.)
  data: 'https://qr-app.vercel.app', // Change to your app URL, GitHub, or any link
  
  // Personalized color scheme - modern teal & warm cream
  colors: {
    dark: '#0D9488FF',   // Teal - distinctive & scannable
    light: '#FEF3C7FF'   // Warm cream background
  },
  
  // Alternative palettes (uncomment to use):
  // colors: { dark: '#7C3AEDFF', light: '#EDE9FEFF' },  // Purple/violet
  // colors: { dark: '#EA580CFF', light: '#FFF7EDFF' },  // Orange/warm
  // colors: { dark: '#0369A1FF', light: '#E0F2FEFF' },  // Sky blue
  
  width: 400,           // Output size in pixels
  margin: 2,            // Quiet zone
  errorCorrection: 'H'  // High - best for printing/display
};

async function generateQR() {
  const outputDir = path.join(__dirname, '..', 'public');
  const outputPath = path.join(outputDir, 'qr-app-personalized.png');

  // Ensure public directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const options = {
    errorCorrectionLevel: CONFIG.errorCorrection,
    type: 'png',
    width: CONFIG.width,
    margin: CONFIG.margin,
    color: CONFIG.colors
  };

  try {
    await QRCode.toFile(outputPath, CONFIG.data, options);
    console.log('✅ Personalized QR code generated!');
    console.log('   Saved to: public/qr-app-personalized.png');
    console.log('   Encodes: ' + CONFIG.data);
  } catch (err) {
    console.error('Error generating QR code:', err);
    process.exit(1);
  }
}

generateQR();
