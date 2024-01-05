import { init } from "$lib/server/db/commnadsT";
import { prepDb } from "$lib/server/db/commands";
init()
await prepDb()
