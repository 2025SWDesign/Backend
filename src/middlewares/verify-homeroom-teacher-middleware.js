import { HTTP_STATUS } from '../constants/http-status.constant.js';
import ClassRepository from '../repositories/class.repository.js';
import StudentsRepository from '../repositories/students.repository.js';
import TeacherRepository from '../repositories/teacher.repository.js';
import { prisma } from '../utils/prisma.utils.js';

const teacherRepository = new TeacherRepository(prisma);
const classRepository = new ClassRepository();
const studentsRepository = new StudentsRepository();

export const verifyHomeroomTeacher = async (req, res, next) => {
  // 검증에 필요한 데이터 호출
  const { user } = req;
  const { classId, studentId } = req.params;

  const teacherFromUser = await teacherRepository.findTeacherByUserId(user.id);
  const classFromParam = await getClassFromParam(classId, studentId);

  // 데이터 유효성 검사
  if (!teacherFromUser) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      status: HTTP_STATUS.FORBIDDEN,
      message: '선생님이 아닙니다.',
    });
  }
  if (!classFromParam) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      status: HTTP_STATUS.NOT_FOUND,
      message: '해당 반에 담임 선생님 혹은 반이 존재하지 않습니다.',
    });
  }
  if (teacherFromUser.teacherId !== classFromParam.teacherId) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      status: HTTP_STATUS.FORBIDDEN,
      message: '해당 반의 담임 선생님이 아닙니다.',
    });
  }
  next();
};

const getClassFromParam = async (classId, studentId) => {
  // classId로 검증
  if (classId) {
    const classById = await classRepository.findClassByClassId(classId);
    if (!classById) return null;

    return classById;
  }

  // studentId로 검증
  else if (studentId) {
    const student = await studentsRepository.getOneStudent(studentId);
    const classByStudent = await classRepository.findClassByClassId(
      student.classId,
    );
    if (!classByStudent) return null;

    return classByStudent;
  }
};
