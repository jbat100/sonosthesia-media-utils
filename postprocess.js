const path = require('path');
const parser = require('args-parser');

const { 
    delayAudio,
    truncate,
    fade,
    createGIF
 } = require('./utils');
const { createGIF } = require('./gif');


function run() {
    
    let args = parser(process.argv);

    let filePath = args.file;

    console.log(`Processing file : ${filePath}`);

    if (args.pipeline) {
        switch (args.pipeline) {
            case "unity":
                args.delay = args.delay ?? 0.1;
                args.gif_start = args.gif_start ?? 60.0;
                args.gif_duration = args.gif_duration ?? 8.0;
                break;
            default:
                break;
        }
    }

    if (args.delay) {
        filePath = delayAudio(filePath, args.delay);
    }

    if (args.truncate) {
        filePath = truncate(filePath, args.truncate);
    }

    if (args.fade) {
        filePath = fade(filePath, args.fade);
    }

    console.log(`Processed file : ${filePath}`);

    if (args.gif_start && args.gif_duration) {
        filePath = createGIF(filePath, args.gif_start, args.gif_duration)
        console.log(`GIF file : ${filePath}`);
    }
}

run()