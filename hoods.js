const Hood = {
    MOORE: 'moore',
    MOORE_REMOTE: 'moore_remote',
    BLADE: 'blade',
    CORNERS: 'corners',
}

const len = process.opts.HEIGHT*process.opts.WIDTH

function getIndex(i) {
    if (i < 0) {
        return i % len + len;
    }
    
    if (i >= len) {
        return i % len;
    }
    
    return i;
}

function getHoodFunction(hood, depth) {
    switch(hood) {
        case Hood.MOORE:
            return moore(depth);
        case Hood.MOORE_REMOTE:
            return mooreRemote(depth);
        case Hood.BLADE:
            return blade(depth);
        case Hood.CORNERS:
            return corners(depth);
        default:
            throw new Error(`Unknow hood function: ${hood}`);
    }
}

function moore(depth) {
    if (depth < 1) {
        return () => [];
    }

    return i => [
        ...moore(depth - 1)(i),
        ...mooreRemote(depth)(i),
    ]
}

function mooreRemote(depth) {
    if (depth < 1) {
        throw new Error('Depth should be a positive number');
    }

    return i => {
        const indices = [];

        for (let d = -depth; d <= depth; d++) {
            // top
            indices.push(getIndex(i - process.opts.WIDTH*depth + d));
            // bot
            indices.push(getIndex(i + process.opts.WIDTH*depth + d));
        }

        for (let d = -depth+1; d <= depth-1; d++) {
            // left
            indices.push(getIndex(i - depth + d*process.opts.WIDTH));
            // right
            indices.push(getIndex(i + depth + d*process.opts.WIDTH));
        }

        return indices;
    }
}

function blade(depth) {
    if (depth < 1) {
        return () => [];
    }

    return i => [
        getIndex(i - depth - depth*process.opts.WIDTH),
        getIndex(i + depth - depth*process.opts.WIDTH),
        getIndex(i - depth + depth*process.opts.WIDTH),
        getIndex(i + depth + depth*process.opts.WIDTH),
        ...blade(depth - 1)(i),
    ]
}

function corners(depth) {
    return i => {
        const indices = [];

        for (let j = 0; j < depth; j++) {
            for (let k = 0; k < depth - j; k++) {
                indices.push(getIndex(i - depth - depth*process.opts.WIDTH + k + j*process.opts.WIDTH))
                indices.push(getIndex(i + depth - depth*process.opts.WIDTH - k + j*process.opts.WIDTH))
                indices.push(getIndex(i - depth + depth*process.opts.WIDTH + k - j*process.opts.WIDTH))
                indices.push(getIndex(i + depth + depth*process.opts.WIDTH - k - j*process.opts.WIDTH))
            }
        }

        return indices;
    }
}

module.exports = { Hood, getHoodFunction };