const path = require('path');
const fs = require('fs');
const parser = require('args-parser');

const { compress } = require('./utils');

function run() {

    let args = parser(process.argv);
    let file = args.file;
    let filePaths = [];

    const extensions = ['.mov', 'mp4'];

    if (fs.lstatSync(file).isDirectory()) {
        fs.readdirSync(file).forEach(content => {
            if (extensions.includes(path.extname(content))) {
                console.log(content);
                filePaths.push(path.join(file, content));
            }
          });
    } else {
        filePaths.push(file);
    }

    for (let filePath of filePaths) {
        compress(filePath, args.crf, args.vcodec);
    }
}

run();