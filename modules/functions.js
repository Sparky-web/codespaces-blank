import filesystem from "./filesystem.js";
import { client } from "telegram";

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from "fs"

const __dirname = dirname(fileURLToPath(import.meta.url));

export function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

export const downloadFile = async (media, _client) => {
    const buffer = await client.downloads.downloadMedia(_client, media);

    const filename = `${join(__dirname + "/../.tmp/photos")}/${Date.now()}.jpg`
    await filesystem.createFileIfNotExists(filename)

    fs.createWriteStream(filename).write(buffer)

    return filename
}

export const getPeer = (peerId, type) => {
    let peer;
    if (peerId[0] === "-") peer = peerId.slice(1);
    if (type === "channel") peer = "-100" + peerId;
    else if (type === "chat") peer = "-" + peerId;

    return peer
}