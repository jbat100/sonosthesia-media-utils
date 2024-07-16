const parser = require('args-parser');
const chalk = require('chalk');
const { crop } = require('./utils');

function run() {
    let args = parser(process.argv);
    let filePath = args.file;
    if (args.width && args.height) {
        filePath = crop(filePath, args.width, args.height);
        console.log(chalk.gray(`Crop result written to ${filePath}`));
    }
}

run();