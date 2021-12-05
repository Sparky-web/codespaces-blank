import {Api, TelegramClient} from "telegram";
import {StringSession} from "telegram/sessions/index.js";
import input from "input";
import config from "../config.js";
import database from "./db.js";
import {NewMessage} from "telegram/events/index.js";
import {random} from "./functions.js";

async function initialize() {
    const stringSession = new StringSession(database.db.data.session);

    const client = new TelegramClient(stringSession, config.API_ID, config.API_HASH, {connectionRetries: 5})
    await client.start({
        phoneNumber: async () => await input.text('number ?'),
        password: async () => await input.text('password?'),
        phoneCode: async () => await input.text('Code ?'),
        onError: (err) => console.error(err),
    });

    await database.updateSession(client.session.save())

    client.addEventHandler(parseTelegramMessage, new NewMessage({}));

    telegram.client = client
}

async function parseTelegramMessage(event) {
    const message = event.message;
    const peerId = message.peerId.channelId || message.peerId.chatId;

    if (!peerId) return

    for (let condition of config.forward) {
        if (Math.abs(condition.from) === Number(peerId)
            && message.message.match(new RegExp(condition.filter.join("|"), "ig")))
            await telegram.client.invoke(
                new Api.messages.ForwardMessages({
                    fromPeer: message.peerId,
                    id: [message.id],
                    randomId: [random(0, 1000000000)],
                    toPeer: condition.to
                })
            )
    }
}

export const telegram = {initialize}
export default telegram