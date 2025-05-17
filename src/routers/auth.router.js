import express from 'express';
import AuthRepository from '../repositories/auth.repository.js';
import { prisma } from '../utils/prisma.utils.js';
import AuthService from '../services/auth.service.js';
import AuthController from '../controllers/auth.controller.js';
import { requireRefreshToken } from '../middlewares/require-refresh-token.middleware.js';
import { requireAccessToken } from '../middlewares/require-access-token.middleware.js';
import passport from 'passport';
import '../strategies/kakao-login.strategy.js';
import '../strategies/kakao-link.strategy.js';

const authRouter = express.Router();
const authRepository = new AuthRepository(prisma);
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

// 회원가입
authRouter.post('/sign-up', requireAccessToken('ADMIN'), authController.signUp);

// 학부모 회원가입
authRouter.post(
  '/parents-sign-up',
  requireAccessToken('STUDENT'),
  authController.parentsSignUp,
);

// 로그인
authRouter.post('/sign-in', authController.signIn);

// 로그아웃
authRouter.post('/sign-out', requireRefreshToken, authController.signOut);

// 토큰 재발급
authRouter.post('/token', requireRefreshToken, authController.Token);

// 카카오 로그인
authRouter.get(
  '/kakao/sign-in',
  passport.authenticate('kakao-signIn', {
    session: false,
    authType: 'reprompt',
  }),
);

// 카카오 로그인 정보 반환
authRouter.get(
  '/kakao/sign-in/callback',
  passport.authenticate('kakao-signIn', {
    session: false,
  }),
  authController.kakaoSignIn,
);

// 카카오 연동
authRouter.get(
  '/kakao/connect',
  requireAccessToken(''),
  passport.authenticate('kakao-link', {
    session: false,
    authType: 'reprompt',
  }),
);

// 카카오 연동 콜백
authRouter.get(
  '/kakao/connect/callback',
  requireAccessToken(''),
  passport.authenticate('kakao-link', {
    session: false,
  }),
  authController.kakaoConnect,
);
export { authRouter };
