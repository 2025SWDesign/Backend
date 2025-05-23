import express from 'express';
import StudentsRepository from '../repositories/students.repository.js';
import StudentsService from '../services/students.service.js';
import StudentsController from '../controllers/students.controller.js';
import { prisma } from '../utils/prisma.utils.js';
import { requireAccessToken } from '../middlewares/require-access-token.middleware.js';
import { verifySchoolUser } from '../middlewares/verify-school-user.middleware.js';
import { verifyHomeroomTeacher } from './../middlewares/verify-homeroom-teacher-middleware.js';

const studentsRouter = express.Router({ mergeParams: true });
const studentsRepository = new StudentsRepository(prisma);
const studentsService = new StudentsService(studentsRepository);
const studentsController = new StudentsController(studentsService);

// 반 학생 목록 조회
studentsRouter.get(
  '/class/:classId/students',
  requireAccessToken(''),
  verifySchoolUser,
  //verifyHomeroomTeacher, 어드민도 선생도 봐야함
  studentsController.getClassStudent,
);

// 반이 없는 학생 목록 조회
studentsRouter.get(
  '/students/unassigned',
  requireAccessToken('ADMIN'),
  verifySchoolUser,
  studentsController.getNoClassStudent,
);

// 특정 학생 상세 조회
studentsRouter.get(
  '/students/:studentId',
  requireAccessToken('TEACHER'),
  verifySchoolUser,
  studentsController.getOneStudent,
);

//특정 학생 정보 수정
studentsRouter.patch(
  '/students/:studentId',
  requireAccessToken('TEACHER'),
  verifySchoolUser,
  studentsController.updateOneStudent,
);

// 특정 학생 정보 삭제
// studentsRouter.delete(
//   '/:studentId',
//   requireAccessToken('TEACHER'),
//   verifySchoolUser,
//   studentsController.deleteOneStudent,
// );

// 특정 학생 정보 검색
studentsRouter.get(
  '/search/student',
  requireAccessToken('TEACHER'),
  verifySchoolUser,
  studentsController.searchStudent,
);

export { studentsRouter };
