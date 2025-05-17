import axios from 'axios';
import { SLACK_WEBHOOK_URL } from '../constants/env.constant.js';

const SLACK_WEBHOOK = SLACK_WEBHOOK_URL;

export async function sendSlackErrorAlert(error, req = null) {
  console.log('SLACK_WEBHOOK_URL:', SLACK_WEBHOOK);
  const message = {
    text: `🚨 *에러 발생!*\n\n*Message:* ${error.message}\n*Stack:* \n\`\`\`${error.stack?.substring(0, 4000)}\`\`\`${req ? `\n*URL:* ${req.originalUrl}` : ''}`,
  };

  try {
    await axios.post(SLACK_WEBHOOK, message);
  } catch (err) {
    console.error('Slack 전송 실패:', err.message);
  }
}
