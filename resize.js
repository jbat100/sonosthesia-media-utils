const parser = require('args-parser');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

async function createDirectory(directory) {
    try {
      await fs.mkdir(directory, { recursive: true });
      console.log(chalk.yellow(`Created directory ${directory}`));
    } catch (err) {
      console.error('Directory creation failed:', err);
    }
  }

function roundToNearestPowerOf2(num) {
    if (num < 1) return 1;
    const lower = Math.floor(Math.log2(num));
    const upper = Math.ceil(Math.log2(num));
    const lowerPower = Math.pow(2, lower);
    const upperPower = Math.pow(2, upper);  
    return (num - lowerPower < upperPower - num) ? lowerPower : upperPower;
}

function getPowersOf2Below(num) {
    const powersOf2 = [];
    let power = 128;
    while (power < num) {
      powersOf2.push(power);
      power *= 2;
    }    
    return powersOf2;
}

// Function to add suffix before extension to the file name
function addSuffixToFileName(fileName, suffix) {
    const extname = path.extname(fileName);
    const basename = path.basename(fileName, extname);
    const newFilename = `${basename}${suffix}${extname}`;
    return newFilename;
  }

// Function to resize an image asynchronously
async function resizeImage(inputPath, outputPath, size = { width: 256, height: 256 }) {
  try {
    await sharp(inputPath)
      .resize(size.width, size.height)
      .toFile(outputPath);
    console.log(chalk.gray(`Resized ${path.basename(inputPath)} and saved as ${path.basename(outputPath)}`));
  } catch (error) {
    console.error(`Error resizing ${path.basename(inputPath)}:`, error);
  }
}

// Function to resize all PNG images in a folder asynchronously
async function resizeImagesInFolder(folderPath, size = { width: 256, height: 256 }) {
  try {
    const files = await fs.readdir(folderPath);
    const resizePromises = files.map(async (file) => {
      if (path.extname(file).toLowerCase() === '.png') {
        const inputPath = path.join(folderPath, file);
        const outputPath = path.join(folderPath, addSuffixToFileName(file, `_${size.width}_${size.height}`));
        await resizeImage(inputPath, outputPath, size);
      }
    });
    await Promise.all(resizePromises);
  } catch (error) {
    console.error(`Error processing folder ${folderPath}:`, error);
  }
}

// Function to resize all PNG images in a folder asynchronously
async function resizeIconsFolder(folderPath, size = 256) {
    try {
      const files = await fs.readdir(folderPath);
      const outputFolderPath = path.join(folderPath, 'Resized', `${path.basename(folderPath)}_${size}px`);
      await createDirectory(outputFolderPath);
      const resizePromises = files.map(async (file) => {
        if (path.extname(file).toLowerCase() === '.png') {
          const inputPath = path.join(folderPath, file);
          const outputPath = path.join(outputFolderPath, addSuffixToFileName(file, `_${size}px`));
          await resizeImage(inputPath, outputPath, {width:size, height:size});
        }
      });
      await Promise.all(resizePromises);
      console.log(chalk.green(`Created icons with size ${size} at ${outputFolderPath}`));
    } catch (error) {
      console.error(`Error processing folder ${folderPath}:`, error);
    }
  }

function run() {
    let args = parser(process.argv);
    if (args.icons) {
        let size = !!args.size ? parseInt(args.size) : 256;
        if (args.path) {
            for (const power of getPowersOf2Below(size)) {
                resizeIconsFolder(args.path, power);
            }
        }
    } else {
        let width = !!args.width ? parseInt(args.width) : 256;
        let height = !!args.width ? parseInt(args.height) : 256;
        if (args.path) {
            resizeImagesInFolder(args.path, {width:width, height: height});
        }
    }
}

run();