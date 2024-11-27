const path = require('path');
const chalk = require('chalk');
const execSync = require('child_process').execSync;

function extractSeconds(input) {
        // Check if input is already a number (or a string representing a number)
        if (!isNaN(input)) {
            return parseInt(input, 10);
        }
        // Otherwise, we assume the format is <minutes>:<seconds>
        const parts = input.split(':');
        if (parts.length === 2) {
            const minutes = parseInt(parts[0], 10);
            const seconds = parseInt(parts[1], 10);
            return minutes * 60 + seconds;
        }
    
        // If the input format is incorrect, return an error or zero
        throw new Error('Invalid input format. Please provide a number or a string in <minutes>:<seconds> format.'); 
}

function getDuration(filePath) {
    const directory = path.dirname(filePath);
    const fileName = path.basename(filePath);
    const command = `ffprobe -i ${fileName} -show_entries format=duration -v quiet -of csv="p=0"`;
    //const command = `ffprobe`;
    try {
        const durationResult = execSync(command, { cwd: directory });
        const duration = parseFloat(durationResult);
        console.log(`Got duration ${duration} with command : ${command}`);
        return duration;
    } catch(error) {
        console.error(error);
        throw error;
    }
    
}

function createGIF(filePath, start, duration, scale) {

    scale = scale ?? 480

    // https://engineering.giphy.com/how-to-make-gifs-with-ffmpeg/
    // ffmpeg -ss 61.0 -t 2.5 -i StickAround.mp4 -filter_complex "[0:v] fps=12,scale=480:-1,split [a][b];[a] palettegen [p];[b][p] paletteuse" SmallerStickAround.gif

    const directory = path.dirname(filePath);
    const fileName = path.basename(filePath);
    const extension = path.extname(filePath);

    const outputFileName = fileName.replace(extension, '') + '_short.gif';

    const command = `ffmpeg -ss ${start} -t ${duration} -i "${fileName}" -filter_complex "[0:v] fps=24,scale=${scale}:-1,split [a][b];[a] palettegen [p];[b][p] paletteuse" "${outputFileName}"`;

    console.log(command);

    execSync(command, { cwd: directory, stdio: 'inherit' });

    return path.join(directory, outputFileName);
}

function extractClip(filePath, start, duration) {

    const fileName = path.basename(filePath);
    const directory = path.dirname(filePath);
    const extension = path.extname(filePath);

    const outputFileName = fileName.replace(extension, '') + '_clip' + 
        `_${start}`.replace('.', '-') + 
        `_${start + duration}`.replace('.', '-') + 
        extension;

    const command = `ffmpeg -ss ${start} -i "${fileName}" -c copy -t ${duration} "${outputFileName}"`;
    console.log(command);
    execSync(command, { cwd: directory, stdio: 'inherit' });

    return path.join(directory, outputFileName);
}

function fade(filePath, fadeDuration) {

    // https://dev.to/dak425/add-fade-in-and-fade-out-effects-with-ffmpeg-2bj7

    const fileDuration = getDuration(filePath)
    const directory = path.dirname(filePath);
    const fileName = path.basename(filePath);
    const extension = path.extname(filePath);
    const outputFileName = fileName.replace(extension, '') + '_faded' + extension;


    let command = `ffmpeg -i "${fileName}" `;
    command += `-vf "fade=t=in:st=0:d=${fadeDuration},fade=t=out:st=${fileDuration-fadeDuration}:d=${fadeDuration}" `;
    command += `-af "afade=t=in:st=0:d=${fadeDuration},afade=t=out:st=${fileDuration-fadeDuration}:d=${fadeDuration}" `;
    command += ` "${outputFileName}"`;
    
    console.log(command);

    execSync(command, { cwd: directory, stdio: 'inherit' });

    return path.join(directory, outputFileName);
}

function truncate(filePath, end) {

    const directory = path.dirname(filePath);
    const fileName = path.basename(filePath);
    const extension = path.extname(filePath);
    const outputFileName = fileName.replace(extension, '') + '_truncated' + extension;

    const command = `ffmpeg -i ${fileName} -c copy -t ${end} ${outputFileName}`;

    console.log(command);

    execSync(command, { cwd: directory, stdio: 'inherit' });

    return path.join(directory, outputFileName);
}

function delayAudio(filePath, seconds) {

    const directory = path.dirname(filePath);
    const fileName = path.basename(filePath);
    const extension = path.extname(filePath);
    const outputFileName = fileName.replace(extension, '') + '_delayed' + extension;
    
    const command = `ffmpeg -i "${fileName}" -itsoffset ${seconds} -i "${fileName}" -map 0:v -map 1:a -c copy "${outputFileName}"`;

    // ffmpeg -i "Movie_008.mp4" -itsoffset 0.12 -i "Movie_008.mp4" -map 0:v -map 1:a -c copy "Movie_008_delayed.mp4"

    console.log(command);

    execSync(command, { cwd: directory, stdio: 'inherit' });

    return path.join(directory, outputFileName);
}

function crop(filePath, width, height) {

    const directory = path.dirname(filePath);
    const fileName = path.basename(filePath);
    const extension = path.extname(filePath);
    const outputFileName = fileName.replace(extension, '') + `_cropped_${width}_${height}` + extension;
    
    const command = `ffmpeg -i "${fileName}" -vf "crop=${width}:${height}" "${outputFileName}"`;

    console.log(command);

    execSync(command, { cwd: directory, stdio: 'inherit' });

    return path.join(directory, outputFileName);
}

function cropAdvanced(filePath, width, height, x, y) {

    // typical 4K capture is 3840 x 2160

    const directory = path.dirname(filePath);
    const fileName = path.basename(filePath);
    const extension = path.extname(filePath);
    const outputFileName = fileName.replace(extension, '') + `_cropped_${width}_${height}_${x}_${y}` + extension;
    
    const command = `ffmpeg -i "${fileName}" -vf "crop=w=${width}:h=${height}:x=${x}:y=${y}" "${outputFileName}"`;
    console.log(chalk.blue(command));
    execSync(command, { cwd: directory, stdio: 'inherit' });

    return path.join(directory, outputFileName);

}

function compress(filePath, crf, vcodec) {

    if (!crf)
    {
        crf = 28;
    }
    if (!vcodec)
    {
        vcodec = 'libx264';
        // can be libx265 but quicktime doesn't like it as well as a few others
    }

    const directory = path.dirname(filePath);
    const fileName = path.basename(filePath);
    const extension = path.extname(filePath);
    const outputFileName = fileName.replace(extension, '') + '_' + vcodec + '_' + crf + extension;
    
    const command = `ffmpeg -i "${fileName}" -vcodec ${vcodec} -crf ${crf} "${outputFileName}"`;

    // https://unix.stackexchange.com/questions/28803/how-can-i-reduce-a-videos-size-with-ffmpeg
    // ffmpeg -i input.mp4 -vcodec libx265 -crf 28 output.mp4

    console.log(command);

    execSync(command, { cwd: directory, stdio: 'inherit' });

    return path.join(directory, outputFileName);
}


module.exports = {
    extractSeconds,
    fade,
    extractClip,
    truncate,
    delayAudio,
    getDuration,
    createGIF,
    compress,
    crop,
    cropAdvanced
}