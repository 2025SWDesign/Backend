import passport from 'passport';
import { Strategy as kakaoStrategy } from 'passport-kakao';
import { prisma } from '../utils/prisma.utils.js';
import AuthService from '../services/auth.service.js';
import {
  KAKAO_CLIENT_SECRET,
  KAKAO_CLIENT_ID,
  KAKAO_CONNECT_CALLBACK_URI,
} from '../constants/env.constant.js';
import ClassRepository from '../repositories/class.repository.js';
import { BadRequestError } from '../errors/http.error.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';

const authService = new AuthService();
const classRepository = new ClassRepository(prisma);
console.log('KAKAO_CONNECT_CALLBACK_URI:', KAKAO_CONNECT_CALLBACK_URI);
passport.use(
  'kakao-link',
  new kakaoStrategy(
    {
      clientID: KAKAO_CLIENT_ID,
      clientSecret: KAKAO_CLIENT_SECRET,
      callbackURL: KAKAO_CONNECT_CALLBACK_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existedUser = await prisma.user.findUnique({
          where: { kakaoEmail: profile._json.kakao_account.email },
          include: { teacher: true, student: true },
        });
        if (existedUser) {
          throw new BadRequestError('이미 존재하는 유저입니다.');
        } else {
          const userId = req.user.id;

          const userLinkKakao = await prisma.user.update({
            where: { id: userId },
            data: {
              kakaoEmail: profile._json.kakao_account.email,
            },
          });
          return done(null, { message: '카카오 연동 완료' });
        }
      } catch (error) {
        console.error('Kakao login error:', error);
        done(error, null);
      }
    },
  ),
);
