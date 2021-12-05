import filesystem from "./filesystem.js"
import lodash from "lodash"
import {JSONFile, Low} from 'lowdb'

import path, {dirname} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function createDbIfNotExists() {
    filesystem.createFileIfNotExists(".tmp/db.json",
        `{"session": ""}`
    )
}

async function getDb() {
    createDbIfNotExists()

    const adapter = new JSONFile(path.join(__dirname, "../.tmp/db.json"))
    const db = new Low(adapter)
    await db.read()

    db.chain = lodash.chain(db.data)

    return db
}

async function updateSession(session) {
    database.db.data.session = session
    await database.db.write()
}


async function initialize() {
    database.db = await getDb()
    database.db.chain = lodash.chain(database.db.data)
}

export const database = {initialize, updateSession}
export default database