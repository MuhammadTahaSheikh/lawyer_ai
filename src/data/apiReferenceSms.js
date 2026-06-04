/** Curated reference: `/sms` — backend/routes/inboundSMS.js */

export const smsCategory = {
  id: "sms",
  title: "SMS",
  description:
    "Inbound SMS webhook endpoint (Twilio). Matches sender phone to case client phone numbers, writes inbound communications, and emits Socket.IO updates.",
};

export const smsEndpoints = [
  {
    id: "post-sms-incoming",
    title: "Inbound SMS webhook",
    method: "POST",
    path: "/sms/incoming",
    description:
      "Expects Twilio-style form/body keys `From` and `Body`. Normalizes phone digits, matches by last 10 digits against `cases.clients_phone_number`, inserts into `communications`, emits `newCommunication` to `case-<id>` room, returns Twilio XML response.",
    headers: [
      { name: "Content-Type", required: true, description: "Typically `application/x-www-form-urlencoded` from Twilio." },
      { name: "x-api-key", required: true, description: "API key unless this route is exempted in deployment." },
    ],
    requestBody: { example: `{ "From": "+1 (305) 555-1212", "Body": "Hello" }` },
    responses: [{ status: 200, description: "XML `<Response></Response>`." }, { status: 400, description: "Missing From/Body." }],
  },
];
