const parser = require('args-parser');
const chalk = require('chalk');
const { extractClip, fade, extractSeconds } = require('./utils');

function run() {
    let args = parser(process.argv);
    let filePath = args.file;
    let start = extractSeconds(args.start);
    let duration = null;
    if (args.duration) {
        duration = extractSeconds(args.duration);
    } else if (args.end) {
        let end = extractSeconds(args.end);
        duration = end - start;
    }
    if (start && duration) {
        filePath = extractClip(filePath, start, duration);
        console.log(chalk.gray(`Clip extraction result written to ${filePath}`));
        if (args.fade) {
            filePath = fade(filePath, args.fade);
            console.log(chalk.gray(`Fade result written to ${filePath}`));
        }
    }
    console.log(chalk.green(`Clip result written to ${filePath}`));
}

run();