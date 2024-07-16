const parser = require('args-parser');
const chalk = require('chalk');
const { extractClip, fade, extractSeconds } = require('./utils');

function run() {
    let args = parser(process.argv);
    let first = args.first;
    let second = args.second;
}

run();