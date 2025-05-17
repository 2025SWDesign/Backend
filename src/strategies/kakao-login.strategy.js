import passport from 'passport';
import { Strategy as kakaoStrategy } from 'passport-kakao';
import { prisma } from '../utils/prisma.utils.js';
import AuthService from '../services/auth.service.js';
import {
  KAKAO_CLIENT_SECRET,
  KAKAO_CLIENT_ID,
  KAKAO_SIGNIN_CALLBACK_URI,
} from '../constants/env.constant.js';
import ClassRepository from '../repositories/class.repository.js';
import { NotFoundError } from '../errors/http.error.js';

const authService = new AuthService();
const classRepository = new ClassRepository(prisma);
passport.use(
  'kakao-signIn',
  new kakaoStrategy(
    {
      clientID: KAKAO_CLIENT_ID,
      clientSecret: KAKAO_CLIENT_SECRET,
      callbackURL: KAKAO_SIGNIN_CALLBACK_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existedUser = await prisma.user.findUnique({
          where: { kakaoEmail: profile._json.kakao_account.email },
          include: { teacher: true, student: true },
        });
        if (existedUser) {
          // 이미 존재하는 유저인 경우에도 로그인시 토큰 발급
          const token = await authService.generateAuthTokens({
            id: existedUser.id,
            role: existedUser.role,
            schoolId: existedUser.schoolId,
          });
          // 담임일 경우 classId 반환
          const teacherId =
            existedUser.role === 'TEACHER'
              ? existedUser.teacher.teacherId
              : null;
          const classData = teacherId
            ? await classRepository.findClassByTeacherId(teacherId)
            : null;
          const classId = classData ? classData.classId : null;
          const userData = {
            ...token,
            classId,
          };

          return done(null, userData);
        } else {
          throw new NotFoundError('연동되지 않는 유저입니다.');
        }
      } catch (error) {
        console.error('Kakao login error:', error);
        done(error, null);
      }
    },
  ),
);
