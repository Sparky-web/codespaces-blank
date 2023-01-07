import filesystem from "./filesystem.js";

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from "fs"

const __dirname = dirname(fileURLToPath(import.meta.url));

export function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

export const downloadFile = async (media, client) => {
    const buffer = await client.downloadMedia(media, {
        workers: 1,
    });

    const filename = `${join(__dirname + "../.tmp/photos")}/${Date.now()}.jpg`
    await filesystem.createFileIfNotExists(filename)

    fs.createWriteStream(filename).write(buffer)

    return filename
}