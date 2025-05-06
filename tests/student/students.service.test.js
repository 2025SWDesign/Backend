import StudentsService from '../../src/services/students.service.js';
import StudentsRepository from '../../src/repositories/students.repository.js';
import ClassRepository from '../../src/repositories/class.repository.js';
import { NotFoundError } from '../../src/errors/http.error.js';

vi.mock('../../src/repositories/students.repository.js', () => {
  return {
    default: class {
      getClassStudent = vi.fn();
      getOneStudent = vi.fn();
      updateOneStudent = vi.fn();
    },
  };
});

vi.mock('../../src/repositories/class.repository.js', () => {
  return {
    default: class {
      findClass = vi.fn();
    },
  };
});

// 반 학생 전체 목록 조회 테스트
describe('StudentsService - getClassStudent()', () => {
  let studentsService;

  beforeEach(() => {
    studentsService = new StudentsService();
    studentsService.studentsRepository = new StudentsRepository();
    studentsService.classRepository = new ClassRepository();

    studentsService.studentsRepository.getClassStudent = vi.fn(); // ✅ 명시적 선언
  });

  test('정상적으로 반 학생 목록을 조회한다', async () => {
    const teacherId = 1;
    const grade = 2;
    const gradeClass = 3;

    // classRepository와 studentsRepository의 mock 설정
    studentsService.classRepository.findClass = vi.fn().mockResolvedValue({
      class_id: 10,
      grade,
      gradeClass,
    });

    studentsService.studentsRepository.getClassStudent = vi
      .fn()
      .mockResolvedValue([
        { studentId: 1, name: '학생1' },
        { studentId: 2, name: '학생2' },
      ]);

    const result = await studentsService.getClassStudent(
      teacherId,
      grade,
      gradeClass,
    );
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('학생1');
  });

  test('해당 반 정보가 없으면 NotFoundError를 던진다', async () => {
    studentsService.classRepository.findClass = vi.fn().mockResolvedValue(null);

    await expect(studentsService.getClassStudent(1, 2, 3)).rejects.toThrowError(
      NotFoundError,
    );
  });
});

// 특정 학생 상세 조회 테스트
describe('StudentsService - getOneStudent()', () => {
  let mockStudentsRepository;
  let studentsService;

  beforeEach(() => {
    mockStudentsRepository = {
      getOneStudent: vi.fn(),
    };

    studentsService = new StudentsService();
    studentsService.studentsRepository = mockStudentsRepository;
    vi.clearAllMocks();
  });

  test('✅ 학생이 존재할 경우 정상적으로 데이터를 반환한다', async () => {
    const fakeStudent = { id: 1, name: '홍길동', userId: 1 };
    mockStudentsRepository.getOneStudent.mockResolvedValue(fakeStudent);

    const result = await studentsService.getOneStudent(1);
    expect(result).toEqual(fakeStudent);
    expect(mockStudentsRepository.getOneStudent).toHaveBeenCalledWith(1);
  });

  test('❌ 존재하지 않는 학생 ID일 경우 NotFoundError를 던진다', async () => {
    mockStudentsRepository.getOneStudent.mockResolvedValue(null);

    await expect(studentsService.getOneStudent(999)).rejects.toThrowError(
      NotFoundError,
    );
    await expect(studentsService.getOneStudent(999)).rejects.toThrowError(
      '해당 학생이 존재하지 않습니다.',
    );
  });
});

// 특정 학생 정보 수정 테스트 (미사용?)
describe('StudentsService - updateOneStudent()', () => {
  let studentsService;
  let mockStudentsRepository;

  beforeEach(() => {
    studentsService = new StudentsService();

    // studentsRepository mock 세팅
    mockStudentsRepository = studentsService.studentsRepository;

    // classRepository mock 세팅
    studentsService.classRepository = {
      findClassByGradeAndClass: vi.fn().mockResolvedValue({ classId: 1 }),
    };

    vi.clearAllMocks();
  });

  test('✅ 학생이 존재할 때, 정보가 정상적으로 수정된다', async () => {
    const studentId = 1;
    const updateData = { name: '이몽룡', grade: 2, gradeClass: 1, number: 5 };

    const fakeStudent = {
      id: studentId,
      name: '홍길동',
      number: 3,
      grade: 2,
      gradeClass: 1,
      userId: 1,
    };

    const updatedStudent = { ...fakeStudent, ...updateData };

    const { name, grade, gradeClass, number } = updateData;
    const classId = 1;

    mockStudentsRepository.getOneStudent.mockResolvedValue(fakeStudent);
    mockStudentsRepository.updateOneStudent.mockResolvedValue(updatedStudent);

    const result = await studentsService.updateOneStudent(
      studentId,
      name,
      grade,
      gradeClass,
      number,
      classId,
    );

    expect(mockStudentsRepository.updateOneStudent).toHaveBeenCalledWith(
      studentId,
      name,
      grade,
      gradeClass,
      number,
      classId,
    );
    expect(result).toEqual(updatedStudent);
  });

  test('❌ 학생이 존재하지 않으면 NotFoundError를 던진다', async () => {
    const studentId = 999;
    const updateData = { name: '성춘향' };

    mockStudentsRepository.getOneStudent.mockResolvedValue(null);

    await expect(
      studentsService.updateOneStudent(studentId, updateData),
    ).rejects.toThrowError(NotFoundError);

    await expect(
      studentsService.updateOneStudent(studentId, updateData),
    ).rejects.toThrowError('해당 학생이 존재하지 않습니다.');
  });
});

// 특정 학생 검색 테스트
describe('StudentsService - searchStudent()', () => {
  let studentsService;
  let mockStudentsRepository;

  beforeEach(() => {
    studentsService = new StudentsService();

    // studentsRepository mock 설정
    mockStudentsRepository = {
      searchStudent: vi.fn(),
    };
    studentsService.studentsRepository = mockStudentsRepository;

    vi.clearAllMocks();
  });

  test('✅ 학생이 존재할 경우 정상적으로 데이터를 반환한다', async () => {
    const name = '홍길동';
    const schoolId = 1;
    const fakeStudent = { id: 1, name: '홍길동', schoolId: 1 };

    mockStudentsRepository.searchStudent.mockResolvedValue(fakeStudent);

    const result = await studentsService.searchStudent(name, schoolId);

    expect(mockStudentsRepository.searchStudent).toHaveBeenCalledWith(
      name,
      schoolId,
    );
    expect(result).toEqual(fakeStudent);
  });

  test('❌ 존재하지 않는 학생일 경우 NotFoundError를 던진다', async () => {
    const name = '없는사람';
    const schoolId = 1;

    mockStudentsRepository.searchStudent.mockResolvedValue(null);

    await expect(
      studentsService.searchStudent(name, schoolId),
    ).rejects.toThrowError(NotFoundError);

    await expect(
      studentsService.searchStudent(name, schoolId),
    ).rejects.toThrowError('해당 학생이 존재하지 않습니다.');
  });
});
