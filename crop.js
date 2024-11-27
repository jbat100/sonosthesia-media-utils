const parser = require('args-parser');
const chalk = require('chalk');
const { crop, cropAdvanced } = require('./utils');

function run() {
    let args = parser(process.argv);
    let filePath = args.file;
    if (args.width && args.height && args.x && args.y) {

        // typical use for 4K side crop
        // node .\crop.js file=f:\Sonosthesia\video\reactive\Pollen.mp4 width=3240 height=1780 x=500 y=200

        filePath = cropAdvanced(filePath, args.width, args.height, args.x, args.y);
        console.log(chalk.gray(`Crop result written to ${filePath}`));
        return;
    }
    if (args.width && args.height) {
        filePath = crop(filePath, args.width, args.height);
        console.log(chalk.gray(`Crop result written to ${filePath}`));
        return;
    }
}

run();