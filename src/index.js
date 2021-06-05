process.opts = {};
process.opts.DATE = new Date().toISOString().replaceAll(':', '-');
process.opts.HEIGHT = 1000;
process.opts.WIDTH = 1000;
process.opts.STATES_NUMBER = 4;
process.opts.ITERATIONS_NUMBER = 600;
process.opts.THRESHOLD = 20;
process.opts.DEPTH = 5;
process.opts.HOOD = 'corners';
process.opts.SAVE_INTERMEDIATE_IMAGES = true;
process.opts.ITERATIONS_PER_IMAGE = 30;
process.opts.QUITE = false;
process.opts.PALLETE = [
    '#325288',
    '#f4eee8',
    '#f5cebe',
    '#114e60',
];

const { createCanvas, ImageData  } = require('canvas');
const fs = require('fs');
const { Hood, getHoodFunction } = require('./hoods');

function initGrid() {
    const grid = [];

    for (let i = 0; i < process.opts.HEIGHT; i++) {
        for (let j = 0; j < process.opts.WIDTH; j++) {
            grid.push(Math.floor(Math.random() * process.opts.STATES_NUMBER));
        }
    }

    return grid;
}

function iterateGrid(grid, hoodIndices) {
    const newGrid = [];

    for (let i = 0; i < grid.length; i++) {
        const curState = grid[i];
        const nextState = (grid[i] + 1) % process.opts.STATES_NUMBER;
        let hoodCounter = 0;

        for (let neighbourIndex of hoodIndices[i]) {
            if (grid[neighbourIndex] === nextState) {
                hoodCounter += 1;
            }
        }

        if (hoodCounter >= process.opts.THRESHOLD) {
            newGrid.push(nextState);
        } else {
            newGrid.push(curState);
        }
    }

    return newGrid;
}

function getHoodIndices() {
    const hoodFunction = getHoodFunction(process.opts.HOOD, process.opts.DEPTH);
    const hoodIndices = [];

    for (let i = 0; i < process.opts.WIDTH*process.opts.HEIGHT; i++) {
        hoodIndices.push(hoodFunction(i));
    }

    return hoodIndices;
}

function stateToColor(state) {
    const color = process.opts.PALLETE[state];

    if (Array.isArray(color)) {
        return color;
    }

    const parseHex = i => parseInt(color.slice(1 + i*2, 3 + i*2), 16);

    return [parseHex(0), parseHex(1), parseHex(2), 255];
}

function createImageBuffer(grid) {
    const canvas = createCanvas(process.opts.WIDTH, process.opts.HEIGHT);
    const context = canvas.getContext('2d')
    const ui8 = new Uint8ClampedArray(process.opts.WIDTH * process.opts.HEIGHT * 4);
    const imageData = new ImageData(ui8, process.opts.WIDTH, process.opts.HEIGHT);

    for (let i = 0; i < grid.length; i++) {
        const color = stateToColor(grid[i]);
    
        imageData.data[i*4 + 0] = color[0];
        imageData.data[i*4 + 1] = color[1];
        imageData.data[i*4 + 2] = color[2];
        imageData.data[i*4 + 3] = color[3];
    }

    context.putImageData(imageData, 0, 0);
    const buffer = canvas.toBuffer('image/png');

    return buffer;
}

function saveImage(grid, name) {   
    const buffer = createImageBuffer(grid);
    fs.writeFileSync(`./${process.opts.DATE}/${name}.png`, buffer);
}

function saveopts() {
    fs.mkdirSync(process.opts.DATE);
    fs.writeFileSync(`./${process.opts.DATE}/opts.json`, JSON.stringify(process.opts, null, 2));
}

function generate() {    
    saveopts();

    const hoodIndices = getHoodIndices();

    console.log(hoodIndices[10+10*1000])
    let grid = initGrid();
    
    for (let i = 0; i < process.opts.ITERATIONS_NUMBER; i++) {
        if (!process.opts.QUITE) {
            const percentage = (i / process.opts.ITERATIONS_NUMBER * 100).toFixed(1);
            console.log(`[${i}/${process.opts.ITERATIONS_NUMBER}] ${percentage}% iterations done`);
        }

        if (process.opts.SAVE_INTERMEDIATE_IMAGES && !(i % process.opts.ITERATIONS_PER_IMAGE)) {
            saveImage(grid, `image_iteration_${i}`);
            console.log(`[${i}/${process.opts.ITERATIONS_NUMBER}] Intermediate image saved`);
        }

        grid = iterateGrid(grid, hoodIndices);
    }

    saveImage(grid, 'final_image');
}

generate();
