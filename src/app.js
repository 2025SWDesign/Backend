import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { globalErrorHandler } from './middlewares/error-handler.middleware.js';
import { apiRouter } from './routers/index.js';
import { NotFoundError } from './errors/http.error.js';
import * as Sentry from '@sentry/node';
import { sendSlackErrorAlert } from './utils/slack.util.js';
import { SENTRY_DSN } from './constants/env.constant.js';

const app = express();
const port = process.env.SERVER_PORT;
Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [Sentry.expressIntegration({ app })],
  tracesSampleRate: 1.0,
});

// CORS 설정
app.use(
  cors({
    origin: '*', // 원래는 프론트엔드 도메인을 허용해야 하지만, 현재 없으므로 제한 X
    credentials: true, // 쿠키 전송 허용 (필요한 경우)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // 허용할 HTTP 메서드
  }),
);
// Error Basic Test Routing
app.get('/error', (req, res) => {
  throw new Error('basic error test');
});

// Error NotFoundError Test Routing
app.get('/not-found-error', (req, res) => {
  throw new NotFoundError('Not found error test');
});
// 미들웨어
app.use(express.json()); // req.body-> JSON 변환을 위해 사용
app.use(express.urlencoded({ extended: true })); // 클라이언트가 보낸 데이터 -> req.body로 변환
app.use(apiRouter);
app.use(globalErrorHandler); // 미들웨어 중, 에러처리 미들웨어는 가장 마지막에
app.use(async (err, req, res, next) => {
  // 1. 에러 로깅 및 전송
  Sentry.captureException(err);
  await sendSlackErrorAlert(err, req);

  // 2. 응답 처리
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    status,
    message,
  });
});
// Test Routing
app.get('/', (req, res) => {
  return res.json('hello world CICD');
});

app.listen(port, () => {
  console.log(`${port}번 포트에서 서버가 열렸습니다!`);
});
