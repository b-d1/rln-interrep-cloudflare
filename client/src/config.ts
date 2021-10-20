import dotenv from 'dotenv';
dotenv.config();

export default {
  INTERREP_MOCK_BASE_URL: process.env.INTERREP_MOCK_BASE_URL || "",
  APP_BASE_URL: process.env.APP_BASE_URL || "",
  RATE_LIMITING_SERVICE_BASE_URL:
    process.env.RATE_LIMITING_SERVICE_BASE_URL || "",
  RATE_LIMITING_SERVICE_BASE_WS_URL:
    process.env.RATE_LIMITING_SERVICE_BASE_WS_URL || "",
  SPAM_TRESHOLD: parseInt(process.env.SPAM_TRESHOLD || "3", 10),
  REGISTER_WAIT_SECONDS: parseInt(
    process.env.REGISTER_WAIT_SECONDS || "15",
    10
  ),
  INTERREP_GROUPS: process.env.INTERREP_GROUPS?.split(",") || [
    "TWITTER",
    "GITHUB",
  ],
  RLN_IDENTIFIER: BigInt(5),
};
