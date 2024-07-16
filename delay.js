const parser = require('args-parser');
const chalk = require('chalk');
const { delayAudio } = require('./utils');

function run() {
    let args = parser(process.argv);
    let filePath = args.file;
    if (args.delay) {
        filePath = delayAudio(filePath, args.delay);
        console.log(chalk.gray(`Audio delay result written to ${filePath}`));
    }
}

run();