import GreenAPI from "../store/greenAPI.tsx";

const authData = GreenAPI

export const SetSettings = async () => {
    if (!authData) {
        return
    }
    try {
        await fetch(`https://api.green-api.com/waInstance${authData.idInstance}/setSettings/${authData.apiTokenInstance}`, {
            method: 'POST',
            body: JSON.stringify({
                webhookUrl: "",
                outgoingWebhook: "yes",
                stateWebhook: "yes",
                incomingWebhook: "yes"
            }),
        });
    }
    catch (e) {
        console.error('Ошибка:', e);
    }
};