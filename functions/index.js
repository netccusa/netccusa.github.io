const { onDocumentCreated, onDocumentDeleted } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const fetch = require("node-fetch");

// PASTE YOUR ACTUAL WEBHOOK URL HERE
const webhookURL = "https://discord.com/api/webhooks/1452806038867935272/5GO9x0wEswGuo93QEi_QuIgPHeJiycG4pMl8Isrx1KJAbd83BJZ-cmqO2x0x5VXW0zu7";

// 1. TRIGGER: When a log is Approved
// Your admin.html saves approved logs to "event_history"
exports.notifyApproved = onDocumentCreated("event_history/{logId}", async (event) => {
    const data = event.data.data();
    
    const payload = {
        embeds: [{
            title: "✅ LOG APPROVED",
            color: 2665893,
            fields: [
                { name: "Personnel", value: data.hostEmail || "Unknown", inline: true },
                { name: "Type", value: data.type || (data.minutes ? "Minutes" : "Event"), inline: true },
                { name: "Details", value: data.minutes ? `${data.minutes} Mins` : "Event Log", inline: true }
            ],
            footer: { text: `Processed by: ${data.approvedBy || "Admin"}` },
            timestamp: new Date().toISOString()
        }]
    };

    await sendToDiscord(payload);
});

// 2. TRIGGER: When an Event Log is Denied
exports.notifyEventDenied = onDocumentDeleted("event_pending/{logId}", async (event) => {
    const data = event.data.data();
    const payload = {
        embeds: [{
            title: "❌ EVENT LOG DENIED",
            color: 14431557,
            description: `An event log from **${data.hostEmail}** was rejected.`,
            timestamp: new Date().toISOString()
        }]
    };
    await sendToDiscord(payload);
});

// 3. TRIGGER: When a Minutes Log is Denied
exports.notifyMinutesDenied = onDocumentDeleted("minutes_pending/{logId}", async (event) => {
    const data = event.data.data();
    const payload = {
        embeds: [{
            title: "❌ MINUTES LOG DENIED",
            color: 14431557,
            description: `A minutes log for **${data.minutes} mins** from **${data.hostEmail}** was rejected.`,
            timestamp: new Date().toISOString()
        }]
    };
    await sendToDiscord(payload);
});

async function sendToDiscord(payload) {
    try {
        await fetch(webhookURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        logger.error("Discord Webhook Error", error);
    }
}