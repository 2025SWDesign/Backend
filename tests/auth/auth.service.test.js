import { describe, test, expect, vi, beforeEach } from 'vitest';
import AuthService from '../../src/services/auth.service.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

vi.mock('../../src/repositories/auth.repository.js', () => {
  return {
    default: class {
      findUserByEmail = vi.fn().mockResolvedValue(null);
      create = vi.fn().mockResolvedValue({ id: 1, email: 'new@user.com' });
      upsertRefreshToken = vi.fn().mockResolvedValue(undefined);
      addKakaoInfo = vi.fn().mockResolvedValue({ userId: 1 });
    },
  };
});

vi.mock('../../src/repositories/school.repository.js', () => {
  return {
    default: class {
      findSchoolBySchoolName = vi
        .fn()
        .mockResolvedValue([{ schoolId: 5, schoolName: '서울고등학교' }]);
    },
  };
});

vi.mock('../../src/repositories/user.repository.js', () => {
  return {
    default: class {
      findClass = vi.fn().mockResolvedValue({ classId: 20 });
    },
  };
});

vi.mock('../../src/repositories/class.repository.js', () => {
  return {
    default: class {},
  };
});

// 회원가입 테스트 코드
describe('AuthService - signUp()', () => {
  let authService;

  beforeEach(() => {
    authService = new AuthService();
  });

  // ✅ 정상적인 학생 회원가입
  test('학생이 올바른 정보로 회원가입하면 계정이 생성된다', async () => {
    const input = {
      email: 'new@user.com',
      name: '홍길동',
      role: 'STUDENT',
      password: 'password123',
      passwordCheck: 'password123',
      photo: 'naver.com',
      subject: null,
      grade: 1,
      number: 3,
      gradeClass: 2,
      schoolName: '서울고등학교',
    };

    const result = await authService.signUp(input);

    expect(result).toHaveProperty('id');
    expect(result.email).toBe('new@user.com');
  });

  // ❌ 필수 입력 누락
  test('email, name, role, password가 없으면 BadRequestError 발생', async () => {
    const input = {
      email: '',
      name: '',
      role: '',
      password: '',
    };

    await expect(authService.signUp(input)).rejects.toThrow('Bad Request');
  });

  // ❌ 중복 이메일
  test('이미 가입된 이메일이면 ConflictError 발생', async () => {
    authService.authRepository.findUserByEmail = vi
      .fn()
      .mockResolvedValue({ id: 1 });

    const input = {
      email: 'exists@user.com',
      name: '이미있음',
      role: 'STUDENT',
      password: '123456',
      passwordCheck: '123456',
      subject: null,
      grade: 1,
      number: 1,
      gradeClass: 1,
      schoolName: '서울고등학교',
    };

    await expect(authService.signUp(input)).rejects.toThrow(
      '이미 가입 된 사용자입니다.',
    );
  });

  // ❌ 비밀번호 불일치
  test('password와 passwordCheck가 다르면 ConflictError 발생', async () => {
    const input = {
      email: 'user@domain.com',
      name: '이름',
      role: 'STUDENT',
      password: '123456',
      passwordCheck: 'notmatch',
      subject: null,
      grade: 1,
      number: 1,
      gradeClass: 1,
      schoolName: '서울고등학교',
    };

    await expect(authService.signUp(input)).rejects.toThrow(
      '입력한 두 비밀번호가 일치하지 않습니다.',
    );
  });

  // ❌ 학생이 과목을 입력함
  test('학생이 과목(subject)을 입력하면 BadRequestError 발생', async () => {
    const input = {
      email: 'test@domain.com',
      name: '학생',
      role: 'STUDENT',
      password: '1234',
      passwordCheck: '1234',
      photo: '',
      subject: '수학',
      grade: 1,
      number: 1,
      gradeClass: 1,
      schoolName: '서울고등학교',
    };

    await expect(authService.signUp(input)).rejects.toThrow(
      '학생은 과목을 입력할 수 없습니다.',
    );
  });

  // ❌ 선생님이 학년/번호/반 입력함
  test('선생님이 학년/반/번호를 입력하면 BadRequestError 발생', async () => {
    const input = {
      email: 'bad@teacher.com',
      name: '잘못된선생',
      role: 'TEACHER',
      password: '1234',
      passwordCheck: '1234',
      photo: '',
      subject: '영어',
      grade: 2,
      number: 10,
      gradeClass: 1,
      schoolName: '서울고등학교',
    };

    await expect(authService.signUp(input)).rejects.toThrow(
      '선생님은 학년, 반, 번호를 입력할 수 없습니다.',
    );
  });

  // ✅ 정상적인 선생님 회원가입
  test('선생님이 올바른 정보로 회원가입하면 계정이 생성된다', async () => {
    const input = {
      email: 'new@user.com',
      name: '김선생',
      role: 'TEACHER',
      password: 'teach123',
      passwordCheck: 'teach123',
      photo: 'naver.com',
      subject: '과학',
      grade: null,
      number: null,
      gradeClass: null,
      schoolName: '서울고등학교',
    };

    const result = await authService.signUp(input);

    expect(result).toHaveProperty('id');
    expect(result.email).toBe('new@user.com');
  });

  // ❌ 없는 학교명
  test('입력한 학교명이 존재하지 않으면 NotFoundError 발생', async () => {
    authService.schoolRepository.findSchoolBySchoolName = vi
      .fn()
      .mockResolvedValue(null);

    const input = {
      email: 'x@x.com',
      name: 'no school',
      role: 'STUDENT',
      password: '1',
      passwordCheck: '1',
      subject: null,
      grade: 1,
      number: 1,
      gradeClass: 1,
      schoolName: '없는학교',
    };

    await expect(authService.signUp(input)).rejects.toThrow(
      '해당되는 학교가 없습니다.',
    );
  });
});

// 로그인 테스트 코드
describe('AuthService - signIn()', () => {
  let authService;

  beforeEach(() => {
    authService = new AuthService();

    // 기본 mock: 로그인 성공 시 사용자 정보
    authService.authRepository.findUserByEmail = vi.fn().mockResolvedValue({
      id: 1,
      email: 'login@user.com',
      name: '로그인유저',
      role: 'STUDENT',
      password: bcrypt.hashSync('correctpassword', 10), // bcrypt로 암호화된 비밀번호
    });

    authService.authRepository.storeRefreshToken = vi.fn();
  });

  test('정상 로그인 시 accessToken과 refreshToken을 반환한다', async () => {
    const result = await authService.signIn({
      email: 'login@user.com',
      password: 'correctpassword',
    });

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
  });

  test('존재하지 않는 이메일이면 로그인 실패 (UnauthorizedError)', async () => {
    authService.authRepository.findUserByEmail = vi
      .fn()
      .mockResolvedValue(null);

    await expect(
      authService.signIn({
        email: 'nonexistent@user.com',
        password: 'irrelevant',
      }),
    ).rejects.toThrow('인증 정보가 유효하지 않습니다.');
  });

  test('비밀번호 불일치 시 로그인 실패 (UnauthorizedError)', async () => {
    authService.authRepository.findUserByEmail = vi.fn().mockResolvedValue({
      id: 1,
      email: 'login@user.com',
      name: '로그인유저',
      role: 'STUDENT',
      password: bcrypt.hashSync('actualPassword', 10),
    });

    await expect(
      authService.signIn({
        email: 'login@user.com',
        password: 'wrongpassword',
      }),
    ).rejects.toThrow('인증 정보가 유효하지 않습니다.');
  });
});

// 로그아웃 테스트 코드
describe('AuthService - signOut()', () => {
  let authService;

  beforeEach(() => {
    authService = new AuthService();
  });

  test('signOut()은 authRepository.signOut을 호출한다', async () => {
    const mockFn = vi.fn().mockResolvedValue(1); // 실제 userId 반환되는 형태

    authService.authRepository.signOut = mockFn;

    const user = { id: 1 };
    const result = await authService.signOut(user);

    expect(mockFn).toHaveBeenCalledWith(user);
    expect(result).toBe(1); // 반환값까지 확인
  });
});

// 토큰 발급 테스트
describe('AuthService - generateAuthTokens()', () => {
  let authService;

  beforeEach(() => {
    authService = new AuthService();
  });

  test('accessToken과 refreshToken을 발급하고 저장 요청을 보낸다', async () => {
    const payload = {
      id: 42,
      name: '테스트유저',
      role: 'STUDENT',
      schoolId: 101,
    };

    const result = await authService.generateAuthTokens(payload);

    // 토큰 생성 여부 확인
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result.schoolId).toBe(payload.schoolId);

    // 토큰 형식 검증 (decode로 확인)
    const decoded = jwt.decode(result.accessToken);
    expect(decoded).toMatchObject({
      id: payload.id,
      name: payload.name,
      role: payload.role,
      schoolId: payload.schoolId,
    });

    // refreshToken 저장 여부 확인
    expect(authService.authRepository.upsertRefreshToken).toHaveBeenCalledWith(
      payload.id,
      result.refreshToken,
    );
  });
});

// 카카오 로그인 추가 정보 입력 테스트 코드
describe('AuthService - addKakaoInfo()', () => {
  let authService;

  beforeEach(() => {
    authService = new AuthService();
  });

  test('필수 입력 누락 시 BadRequestError', async () => {
    const input = {
      userId: null,
      name: '',
      role: '',
    };

    await expect(authService.addKakaoInfo(input)).rejects.toThrow(
      'Bad Request',
    );
  });

  test('학생이 과목 입력 시 BadRequestError', async () => {
    const input = {
      userId: 1,
      name: '학생',
      role: 'STUDENT',
      subject: '영어',
      grade: 1,
      number: 1,
      gradeClass: 1,
      schoolName: '서울고등학교',
    };

    await expect(authService.addKakaoInfo(input)).rejects.toThrow(
      '학생은 과목을 입력할 수 없습니다.',
    );
  });

  test('선생님이 반 정보 입력 시 BadRequestError', async () => {
    const input = {
      userId: 1,
      name: '선생님',
      role: 'TEACHER',
      subject: '수학',
      grade: 1,
      number: 1,
      gradeClass: 1,
      schoolName: '서울고등학교',
    };

    await expect(authService.addKakaoInfo(input)).rejects.toThrow(
      '선생님은 학년, 반, 번호를 입력할 수 없습니다.',
    );
  });

  test('정상 입력 시 유저 추가 정보 저장', async () => {
    const input = {
      userId: 1,
      name: '홍길동',
      role: 'STUDENT',
      subject: null,
      photo: 'url',
      grade: 1,
      gradeClass: 2,
      number: 3,
      schoolName: '서울고등학교',
    };
    console.log('🐛 입력값 확인:', input);
    const result = await authService.addKakaoInfo(input);
    expect(result).toHaveProperty('userId');
  }); //오류코드

  test('학교가 존재하지 않으면 NotFoundError', async () => {
    authService.schoolRepository.findSchoolBySchoolName = vi
      .fn()
      .mockResolvedValue(null);

    const input = {
      userId: 1,
      name: '학생',
      role: 'STUDENT',
      subject: null,
      grade: 1,
      number: 1,
      gradeClass: 1,
      schoolName: '없는학교',
    };

    await expect(authService.addKakaoInfo(input)).rejects.toThrow(
      '해당되는 학교가 없습니다.',
    );
  });
});
