import { Api, TelegramClient, client } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input";
import config from "../config.js";
import database from "./db.js";
import { NewMessage } from "telegram/events/index.js";
import { downloadFile, random, getPeer } from "./functions.js";

async function initialize() {
    const stringSession = new StringSession(database.db.data.session);
    // const stringSession = new StringSession("");

    const client = new TelegramClient(
        stringSession,
        config.API_ID,
        config.API_HASH,
        { connectionRetries: 5 }
    );
    await client.start({
        phoneNumber: async () => await input.text("number ?"),
        password: async () => await input.text("password?"),
        phoneCode: async () => await input.text("Code ?"),
        onError: (err) => console.error(err),
    });

    console.log(`Config: `, config);

    await database.updateSession(client.session.save());

    client.addEventHandler(parseTelegramMessage, new NewMessage({}));

    const data = await client.getMessages("-1001794644849", { ids: 3 });
    console.log(data);

    telegram.client = client;
}

async function parseTelegramMessage(event) {
    const client = telegram.client
    const message = event.message;
    const peerId = message.peerId.channelId || message.peerId.chatId;

    console.log(`\nNew message: ${message.message}. Peer id: ${+peerId}`);

    if (!peerId) return;

    for (let condition of config.forward) {
        console.log(
            `Math.abs(condition.from) === Number(peerId) ${condition.from.id} ${peerId}: ${Math.abs(condition.from.id) === Number(peerId)
            }`
        );
        console.log(
            `message.message.match(new RegExp(condition.filter.join("|"), "ig")`,
            !!message.message.match(new RegExp(condition.filter.join("|"), "ig"))
        );

        if (
            !(
                Math.abs(Number(condition.from.id)) === Number(peerId) &&
                message.message.match(new RegExp(condition.filter.join("|"), "ig"))
            )
        )
            return;


        let peer = getPeer(condition.to.id, condition.to.type)
        let fromPeer = getPeer(condition.from.id, condition.from.type)

        if (condition.topic) {
            if (!message.replyTo?.forumTopic) return

            const [topicMessage] = await client.getMessages(fromPeer, { ids: message.replyTo.replyToMsgId });
            if (topicMessage?.action?.title !== condition.topic) return
        }

        const isLink = message?.media?.className === "MessageMediaWebPage";

        let messageToSend = {
            ...message,
            randomId: random(0, 1000000000),
            peer,
        };

        const _client = message._client;

        if (message.media && message.media.className === "MessageMediaPhoto") {
            const filePath = await downloadFile(message.media, _client);
            await new Promise((r) => setTimeout(r, 500));
            await telegram.client.sendFile(peer, {
                file: filePath,
                caption: message.message,
                randomId: random(0, 1000000000),
            });

            return;
        }

        await telegram.client.invoke(
            message.media && !isLink
                ? new Api.messages.SendMedia(messageToSend)
                : new Api.messages.SendMessage({
                    ...message,
                    message: message.message,
                    randomId: random(0, 1000000000),
                    peer: peer,
                })
        );
    }
}

export const telegram = { initialize };
export default telegram;
