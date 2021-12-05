import database from "./modules/db.js";
await database.initialize()

import tg from "./modules/tg.js"
await tg.initialize()