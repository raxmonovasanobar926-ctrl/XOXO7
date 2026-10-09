import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processWavingRobot() {
  const inputPath = 'C:/Users/Victus/.gemini/antigravity-ide/brain/d65341b1-2123-4891-87e8-f1880652c6a8/robot_buddy_transparent_1791464486291.jpg';
  const outputPath = path.resolve('public/images/robot_buddy_waving.png');

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  // Flood fill / threshold background
  // The dark background has R, G, B roughly < 55. The white border is > 200.
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Check if it's the dark background around the sticker
    if (r < 52 && g < 52 && b < 52) {
      data[i + 3] = 0; // Transparent
    } else if (r < 65 && g < 65 && b < 65) {
      // Smooth feather edge
      const alpha = Math.min(255, Math.max(0, (Math.max(r, g, b) - 52) * 20));
      data[i + 3] = alpha;
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(outputPath);

  console.log('Saved transparent waving robot to:', outputPath);
}

async function processOriginalRobot() {
  const inputPath = 'C:/Users/Victus/.gemini/antigravity-ide/brain/d65341b1-2123-4891-87e8-f1880652c6a8/.user_uploaded/media_1791464020244.png';
  const outputPath = path.resolve('public/images/robot_buddy_standing.png');

  if (!fs.existsSync(inputPath)) {
    console.log('Original image not found at', inputPath);
    return;
  }

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  // Background in the user's photo is neutral grey-beige around ~210-225
  // The robot itself is mint green (#68C4B4), grey arms (#8B939B), etc.
  // Sample corner color:
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];
  console.log(`Original image corner BG color: rgb(${bgR}, ${bgG}, ${bgB})`);

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dist = Math.hypot(r - bgR, g - bgG, b - bgB);
    if (dist < 28) {
      data[i + 3] = 0;
    } else if (dist < 42) {
      const factor = (dist - 28) / (42 - 28);
      data[i + 3] = Math.round(factor * 255);
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(outputPath);

  console.log('Saved standing robot to:', outputPath);
}

Promise.all([processWavingRobot(), processOriginalRobot()]).then(() => {
  console.log('All robot images processed successfully!');
}).catch(console.error);
