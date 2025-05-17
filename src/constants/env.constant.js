import 'dotenv/config';

export const SERVER_PORT = process.env.SERVER_PORT;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
export const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET;
export const KAKAO_SIGNIN_CALLBACK_URI = process.env.KAKAO_SIGNIN_CALLBACK_URI;
export const KAKAO_CONNECT_CALLBACK_URI =
  process.env.KAKAO_CONNECT_CALLBACK_URI;
export const ACCESS_TOKEN_EXPIRED_IN = process.env.ACCESS_TOKEN_EXPIRED_IN;
export const REFRESH_TOKEN_EXPIRED_IN = process.env.REFRESH_TOKEN_EXPIRED_IN;
export const CRYPTO_SECRET_KEY = process.env.CRYPTO_SECRET_KEY;
export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const SENTRY_DSN = process.env.SENTRY_DSN;
export const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
