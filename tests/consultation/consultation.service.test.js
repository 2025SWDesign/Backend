import { describe, test, expect, beforeEach, vi } from 'vitest';
import ConsultationService from '../../src/services/consultation.service.js';

vi.mock('../../src/repositories/consultation.repository.js', () => {
  return {
    default: class {
      getAllConsultation = vi.fn().mockResolvedValue([{}]);
      getConsultationByDate = vi.fn().mockResolvedValue([{}]);
      getConsultationBySubject = vi.fn().mockResolvedValue([{}]);
      getConsultationByTitle = vi.fn().mockResolvedValue([{}]);
      getConsultationByAuthor = vi.fn().mockResolvedValue([{}]);
      getConsultationContent = vi.fn().mockResolvedValue({});
      create = vi.fn().mockResolvedValue({});
      findExistedConsultation = vi.fn().mockResolvedValue(null);
    },
  };
});

vi.mock('../../src/repositories/students.repository.js', () => {
  return {
    default: class {
      getOneStudent = vi.fn().mockResolvedValue({
        studentId: 1,
        grade: 1,
        number: 3,
        gradeClass: 2,
        user: {
          id: 1,
          name: '홍길동',
          email: 'student@example.com',
          photo: 'somephoto.jpg',
        },
      });
    },
  };
});

vi.mock('../../src/repositories/teacher.repository.js', () => {
  return {
    default: class {
      findTeacherByUserId = vi.fn().mockResolvedValue({
        teacherId: 2,
        subject: '과학',
        user: {
          name: '홍길동',
        },
      });
    },
  };
});

let consultationService;

beforeEach(() => {
  consultationService = new ConsultationService();
});

describe('ConsultationService - getAllConsultation()', () => {
  test('학생 ID로 상담 전체 조회 성공', async () => {
    const result = await consultationService.getAllConsultation(1);
    expect(result).toBeInstanceOf(Array);
  });
});

describe('ConsultationService - getConsultation()', () => {
  test('날짜 조건으로 조회 성공', async () => {
    const result = await consultationService.getConsultation(
      '2025-05-05',
      null,
      null,
      null,
      1,
    );
    expect(result).toBeInstanceOf(Array);
  });

  test('과목 조건으로 조회 성공', async () => {
    const result = await consultationService.getConsultation(
      null,
      '과학',
      null,
      null,
      1,
    );
    expect(result).toBeInstanceOf(Array);
  });
});

describe('ConsultationService - getConsultationContent()', () => {
  test('상담 ID로 상세 조회 성공', async () => {
    const result = await consultationService.getConsultationContent({
      studentId: 1,
      consultationId: 10,
    });
    expect(result).toBeDefined();
  });
});

test('정상 입력 시 상담 생성 성공', async () => {
  const input = {
    studentId: 1,
    teacherId: 2,
    date: '2025-05-05',
    nextPlan: '2025-05-10',
    content: '상담 내용',
    subject: '과학',
    title: '진로 상담',
    author: '홍길동', // ✅ 추가
    studentUserId: 1, // ✅ 추가
    userId: 999, // ✅ 추가
  };

  const result = await consultationService.createConsultation(input);
  expect(result).toBeDefined();
});

test('예정일이 상담일보다 빠르면 BadRequestError', async () => {
  const input = {
    studentId: 1,
    teacherId: 2,
    date: '2025-05-10',
    nextPlan: '2025-05-05',
    content: '상담 내용',
    subject: '과학',
    title: '진로 상담',
  };

  await expect(consultationService.createConsultation(input)).rejects.toThrow(
    '상담일은 예정일보다 이전이어야 합니다.',
  );
});
