import AuthService from '../services/auth.service.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';

class AuthController {
  authService = new AuthService();

  // 회원가입
  signUp = async (req, res, next) => {
    try {
      const schoolId = req.user.schoolId;

      const {
        name,
        role,
        email,
        phonenumber,
        homenumber,
        address,
        subject,
        grade,
      } = req.body;

      const data = await this.authService.signUp({
        name,
        role,
        email,
        phonenumber,
        homenumber,
        address,
        subject,
        grade,
        schoolId,
      });

      return res.status(HTTP_STATUS.CREATED).json({
        status: HTTP_STATUS.CREATED,
        message: MESSAGES.AUTH.SIGN_UP.SUCCEED,
        data: {
          ...data,
          password: data.rawPassword,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // 학부모 회원가입
  parentsSignUp = async (req, res, next) => {
    try {
      const { loginId, schoolId, id: userId, name } = req.user;
      console.log('loginId:', loginId, typeof loginId);
      console.log('schoolId:', schoolId, typeof schoolId);

      const data = await this.authService.parentsSignUp({
        loginId,
        schoolId,
        userId,
        name,
      });

      return res.status(HTTP_STATUS.CREATED).json({
        status: HTTP_STATUS.CREATED,
        message: MESSAGES.AUTH.SIGN_UP.SUCCEED,
        data: {
          ...data,
          password: data.rawPassword,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // 로그인
  signIn = async (req, res, next) => {
    try {
      const { loginId, password } = req.body;

      const data = await this.authService.signIn({ loginId, password });

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.AUTH.SIGN_IN.SUCCEED,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // 로그아웃
  signOut = async (req, res, next) => {
    try {
      const user = req.user;
      const data = await this.authService.signOut(user);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.AUTH.SIGN_OUT.SUCCEED,
        data: { id: user.id },
      });
    } catch (error) {
      next(error);
    }
  };

  // 토큰 재발급
  Token = async (req, res, next) => {
    try {
      const user = req.user;
      const data = await this.authService.token(user);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.AUTH.TOKEN.SUCCEED,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // 카카오 로그인 정보 반환
  kakaoSignIn = async (req, res, next) => {
    try {
      const user = req.user;
      console.log(user);
      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.AUTH.KAKAO.SUCCEED,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
  // 카카오 로그인 추가 정보 입력
  addKakaoInfo = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { name, role, subject, grade, gradeClass, number, schoolName } =
        req.body;

      const data = await this.authService.addKakaoInfo(
        userId,
        name,
        role,
        subject,
        grade,
        gradeClass,
        number,
        schoolName,
      );

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: 'MESSAGES.AUTH.SOCIAL.KAKAKO.MORE_INFO',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  kakaoConnect = async (req, res, next) => {
    try {
      console.log('카카오 연동');
      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '카카오 연동 완료',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
