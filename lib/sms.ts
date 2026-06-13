import Twilio from "twilio";

function getEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error("Missing required environment variable: " + name);
  return val;
}

function getEnvOrUndefined(name: string): string | undefined {
  return process.env[name];
}

let _twilio: ReturnType<typeof Twilio> | null = null

function getTwilio() {
  if (!_twilio) {
    _twilio = Twilio(
      getEnvOrUndefined("TWILIO_ACCOUNT_SID") || "",
      getEnvOrUndefined("TWILIO_AUTH_TOKEN") || "",
    );
  }
  return _twilio;
}

export async function sendSms(to: string, body: string) {
  const message = await getTwilio().messages.create({
    body,
    to,
    from: getEnv("TWILIO_PHONE_NUMBER"),
  });
  return message.sid;
}
