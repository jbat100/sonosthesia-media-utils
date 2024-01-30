const parser = require('args-parser');
const chalk = require('chalk');
const { extractClip, fade } = require('./utils');

function run() {
    let args = parser(process.argv);
    let filePath = args.file;
    if (args.start && args.duration) {
        filePath = extractClip(filePath, args.start, args.duration);
        console.log(chalk.gray(`Clip extraction result written to ${filePath}`));
        if (args.fade) {
            filePath = fade(filePath, args.fade);
            console.log(chalk.gray(`Fade result written to ${filePath}`));
        }
    }
    console.log(chalk.green(`Clip result written to ${filePath}`));
}

run();