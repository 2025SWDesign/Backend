import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma.utils.js';
import { authConstant } from '../constants/auth.constant.js';

class AuthRepository {
  // 회원가입
  create = async ({
    name,
    role,
    email,
    phonenumber,
    homenumber,
    address,
    subject,
    grade,
    schoolId,
    rawPassword,
  }) => {
    //비밀번호 암호화처리
    const hashedPassword = bcrypt.hashSync(
      rawPassword,
      authConstant.HASH_SALT_ROUNDS,
    );

    const admissionYear = new Date().getFullYear();

    const result = await prisma.$transaction(async (tx) => {
      // 1단계: 사용자 생성
      const createdUser = await tx.user.create({
        data: {
          name,
          role,
          email,
          password: hashedPassword,
          schoolId,
          ...(role === 'TEACHER' && {
            teacher: {
              create: { subject },
            },
          }),
          ...(role === 'STUDENT' && {
            student: {
              create: {
                phonenumber,
                homenumber,
                address,
                number: null,
                classId: null,
              },
            },
          }),
        },
        include: { teacher: true, student: true },
      });

      // 2단계: loginId 생성 및 업데이트
      const paddedId = String(createdUser.id).padStart(5, '0');
      const loginId = `${admissionYear}${paddedId}`;

      const updatedUser = await tx.user.update({
        where: { id: createdUser.id },
        data: { loginId },
        include: { teacher: true, student: true },
      });

      return updatedUser;
    });
    result.password = undefined;
    return result;
  };

  // 로그인 ID로 유저 찾기
  findUserByLoginId = async (loginId) => {
    const user = await prisma.user.findUnique({
      where: { loginId },
      include: {
        teacher: {
          select: {
            teacherId: true,
          },
        },
      },
    });
    return user;
  };

  // 유저 ID로 유저 찾기
  findUserById = async (id) => {
    const user = await prisma.user.findUnique({
      where: { id },
      omit: { password: true },
      // select: {
      //   data: {},
      // },
    });

    return user;
  };

  // RefreshToken 생성 및 업데이트
  upsertRefreshToken = async (userId, refreshToken) => {
    const hashedRefreshToken = bcrypt.hashSync(
      refreshToken,
      authConstant.HASH_SALT_ROUNDS,
    );
    const getRefreshToken = await prisma.refreshToken.upsert({
      where: { userId },
      // refreshToken을 가지고 있는 경우 : 업데이트
      update: { refreshToken: hashedRefreshToken },
      // refreshToken이 없는 경우 : 생성
      create: {
        userId,
        refreshToken: hashedRefreshToken,
      },
    });

    return getRefreshToken;
  };

  // userId로 refreshToken 찾기
  findRefreshToken = async (id) => {
    const existedRefreshToken = await prisma.refreshToken.findUnique({
      where: { userId: id },
    });

    return existedRefreshToken;
  };

  // 로그아웃
  signOut = async (user) => {
    const userId = user.id;

    await prisma.refreshToken.update({
      where: { userId },
      data: {
        refreshToken: null,
      },
    });

    return userId;
  };

  // 카카오 로그인 추가 정보 입력
  addKakaoInfo = async (
    userId,
    name,
    role,
    subject,
    grade,
    gradeClass,
    number,
    schoolId,
    classId,
  ) => {
    const userData = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        role,
        schoolId,
      },
    });
    // create: {
    //   ...(role === 'TEACHER' && {
    //     // 선생님일 경우 teacher 테이블 생성
    //     teacher: {
    //       create: {
    //         subject,
    //       },
    //     },
    //   }),
    //   ...(role === 'STUDENT' && {
    //     // 학생일 경우 student 테이블 생성
    //     student: {
    //       create: {
    //         grade,
    //         number,
    //         gradeClass,
    //         // 학생 테이블과 반 테이블 연결
    //         classId,
    //       },
    //     },
    //   }),
    // },
    if (role === 'TEACHER') {
      await prisma.teacher.create({
        data: {
          userId,
          subject,
        },
      });
    } else if (role === 'STUDENT') {
      await prisma.student.create({
        data: {
          userId,
          grade,
          number,
          gradeClass,
          classId,
        },
      });
    }

    return userData;
  };
}

export default AuthRepository;
