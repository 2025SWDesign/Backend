import AuthRepository from '../repositories/auth.repository.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  ConflictError,
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
} from '../errors/http.error.js';
import {
  ACCESS_TOKEN_EXPIRED_IN,
  REFRESH_TOKEN_EXPIRED_IN,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from '../constants/env.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import SchoolRepository from '../repositories/school.repository.js';
import UserRepository from '../repositories/user.repository.js';
import ClassRepository from '../repositories/class.repository.js';

class AuthService {
  authRepository = new AuthRepository();
  schoolRepository = new SchoolRepository();
  userRepository = new UserRepository();
  classRepository = new ClassRepository();

  signUp = async ({
    email,
    name,
    role,
    password,
    photo,
    passwordCheck,
    subject,
    grade,
    number,
    gradeClass,
    schoolName,
  }) => {
    // 필요한 값을 받지 못할 때 에러 반환
    if (!email || !name || !role || !password) {
      throw new BadRequestError(MESSAGES.AUTH.SIGN_UP.NOT_ENOUGH_DATA);
    }

    // 이메일이 이미 존재한다면 에러 반환
    const existedUser = await this.authRepository.findUserByEmail(email);
    if (existedUser) {
      throw new ConflictError(MESSAGES.AUTH.COMMON.EMAIL.DUPLICATED);
    }

    //비밀번호와 비밀번호 확인이 맞지않다면 에러 반환
    if (password !== passwordCheck) {
      throw new ConflictError(
        MESSAGES.AUTH.COMMON.PASSWORD_CHECK.NOT_MATCHTED_WITH_PASSWORD,
      );
    }

    // 학생이 과목을 작성할려는 경우 에러 반환
    if (role == 'STUDENT' && subject) {
      throw new BadRequestError(MESSAGES.AUTH.SIGN_UP.STUDENT_INVALID);
    }

    // 선생님이 학년, 반, 출석번호를 작성하려는 경우 에러 반환
    if (role == 'TEACHER' && (grade || number || gradeClass)) {
      throw new BadRequestError(MESSAGES.AUTH.SIGN_UP.TEACHER_INVALID);
    }

    // 해당 학교명이 데이터에 없다면 에러 반환
    const existedSchool =
      await this.schoolRepository.findSchoolBySchoolName(schoolName);
    if (!existedSchool) throw new NotFoundError('해당되는 학교가 없습니다.');

    // schoolRepository에서 값을 배열로 받아 오기 때문에 인덱스로 단일 값만 받아옴
    const school = existedSchool[0];
    const schoolId = school.schoolId;

    // 반 데이터에서 id 가져오기
    const classId =
      role === 'STUDENT'
        ? ((await this.userRepository.findClass(grade, gradeClass))?.classId ??
          (() => {
            throw new NotFoundError('해당 반이 존재하지 않습니다.');
          })())
        : null;

    const data = await this.authRepository.create({
      email,
      name,
      role,
      password,
      photo,
      subject,
      grade,
      number,
      gradeClass,
      schoolId,
      classId,
    });

    return data;
  };

  signIn = async ({ email, password }) => {
    const user = await this.authRepository.findUserByEmail(email);
    console.log(user);
    const passwordCheck = user && bcrypt.compareSync(password, user.password);

    if (!passwordCheck) {
      throw new UnauthorizedError(MESSAGES.AUTH.COMMON.UNAUTHORIZED);
    }

    const payload = { id: user.id, role: user.role, schoolId: user.schoolId };

    // accessToken, refreshToken 생성
    const data = await this.generateAuthTokens(payload);

    // 담임일 경우 classId 반환
    const teacherId = user.role === 'TEACHER' ? user.teacher.teacherId : null;
    const classData = teacherId
      ? await this.classRepository.findClassByTeacherId(teacherId)
      : null;
    const classId = classData ? classData.classId : null;

    const tokenWithClassId = {
      ...data,
      classId,
    };

    return tokenWithClassId;
  };

  signOut = async (user) => {
    const data = await this.authRepository.signOut(user);

    return data;
  };

  token = async (user) => {
    const payload = { id: user.id, role: user.role, schoolId: user.schoolId };
    const data = await this.generateAuthTokens(payload);

    return data;
  };

  //토큰 발급 함수
  generateAuthTokens = async (payload) => {
    const userId = payload.id;
    const schoolId = payload.schoolId;

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRED_IN,
    });
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRED_IN,
    });

    await this.authRepository.upsertRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken, schoolId };
  };

  // 카카오 로그인 추가 정보 입력
  addKakaoInfo = async ({
    userId,
    name,
    role,
    subject,
    grade,
    gradeClass,
    number,
    schoolName,
  }) => {
    // 유효성 검사
    const requiredData = !!(userId && role && schoolName && name);
    const optionalData = !!(subject || grade || gradeClass || number);
    if (!requiredData || !optionalData) {
      throw new BadRequestError(MESSAGES.AUTH.SIGN_UP.NOT_ENOUGH_DATA);
    }

    if (role == 'STUDENT' && subject) {
      throw new BadRequestError(MESSAGES.AUTH.SIGN_UP.STUDENT_INVALID);
    }

    if (role == 'TEACHER' && (grade || number || gradeClass)) {
      throw new BadRequestError(MESSAGES.AUTH.SIGN_UP.TEACHER_INVALID);
    }

    const existedSchool =
      await this.schoolRepository.findSchoolBySchoolName(schoolName);
    if (!existedSchool) throw new NotFoundError('해당되는 학교가 없습니다.');

    const school = existedSchool[0];
    const schoolId = school.schoolId;

    // 반 데이터에서 id 가져오기
    const classId =
      role === 'STUDENT'
        ? ((await this.userRepository.findClass(grade, gradeClass))?.classId ??
          (() => {
            throw new NotFoundError('해당 반이 존재하지 않습니다.');
          })())
        : null;

    const data = await this.authRepository.addKakaoInfo(
      userId,
      name,
      role,
      subject,
      grade,
      gradeClass,
      number,
      schoolId,
      classId,
    );

    return data;
  };
}

export default AuthService;
