import cluster from "cluster"
import PusherServer from "pusher"
import PusherClient from "pusher-js"

export const pusherServer = new PusherServer({
    appId: process.env.PUSHER_APP_ID as string,
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY as string,
    secret: process.env.PUSHER_SECRET as string,
    cluster: "ap1",
    useTLS: true
});
const pusherAppKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
if (!pusherAppKey) {
throw new Error("puhser app key is not defined");
}
export const pusherClient = new PusherClient(pusherAppKey, {
    cluster: "ap1"
});