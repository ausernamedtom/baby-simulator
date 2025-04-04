const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceIcon = path.join(__dirname, 'app-icon.png');
const outputDir = path.join(__dirname, 'icons');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Generate icons for each size
sizes.forEach(size => {
    sharp(sourceIcon)
        .resize(size, size)
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
        .then(info => console.log(`Generated ${size}x${size} icon`))
        .catch(err => console.error(`Error generating ${size}x${size} icon:`, err));
}); 