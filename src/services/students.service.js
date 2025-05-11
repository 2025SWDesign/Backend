import { MESSAGES } from '../constants/message.constant.js';
import { NotFoundError } from '../errors/http.error.js';
import ClassRepository from '../repositories/class.repository.js';
import StudentsRepository from '../repositories/students.repository.js';

class StudentsService {
  studentsRepository = new StudentsRepository();
  classRepository = new ClassRepository();
  //반 학생 목록 조회
  getClassStudent = async (classId, schoolId) => {
    const data = await this.studentsRepository.getClassStudent(
      classId,
      schoolId,
    );
    if (!data || data.length === 0) {
      throw new NotFoundError('해당 반의 학생이 존재하지 않습니다.');
    }
    return data;
  };

  //특정 학생 상세 조회 , 유효성 검사
  getOneStudent = async (studentId) => {
    const student = await this.studentsRepository.getOneStudent(studentId);
    console.log(student);
    if (!student) {
      throw new NotFoundError('해당 학생이 존재하지 않습니다.');
    }
    return student;
  };

  //특정 학생 정보 수정
  updateOneStudent = async (
    studentId,
    name,
    grade,
    gradeClass,
    number,
    schoolId,
  ) => {
    //유효성 검사 추가
    const student = await this.studentsRepository.getOneStudent(studentId);
    if (!student) {
      throw new NotFoundError('해당 학생이 존재하지 않습니다.');
    }
    const classByGradeAndClass =
      await this.classRepository.findClassByGradeAndClass(
        grade,
        gradeClass,
        schoolId,
      );
    if (!classByGradeAndClass) {
      throw new NotFoundError('해당 반이 존재하지 않습니다.');
    }
    const data = await this.studentsRepository.updateOneStudent(
      studentId,
      name,
      grade,
      gradeClass,
      number,
      classByGradeAndClass.classId,
    );
    return data;
  };

  //특정 학생 정보 삭제
  deleteOneStudent = async (studentId) => {
    //유효성 검사 추가
    const student = await this.studentsRepository.getOneStudent(studentId);
    if (!student) {
      throw new NotFoundError('해당 학생이 존재하지 않습니다.');
    }

    const data = await this.studentsRepository.deleteOneStudent(studentId);
    return data;
  };

  // 특정 학생 정보 검색
  searchStudent = async (name, schoolId) => {
    const student = await this.studentsRepository.searchStudent(name, schoolId);
    if (!student) {
      throw new NotFoundError('해당 학생이 존재하지 않습니다.');
    }
    return student;
  };
}
export default StudentsService;
