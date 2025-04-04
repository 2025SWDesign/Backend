import express from 'express';
import GradesRepository from '../repositories/grades.repository.js';
import GradesService from '../services/grades.service.js';
import GradesController from '../controllers/grades.controller.js';
import { prisma } from '../utils/prisma.utils.js';
import { requireAccessToken } from '../middlewares/require-access-token.middleware.js';

const gradesRouter = express.Router();
const gradesRepository = new GradesRepository(prisma);
const gradesService = new GradesService(gradesRepository);
const gradesController = new GradesController(gradesService);

// 성적 입력
gradesRouter.post(
  '/students/:studentId',
  requireAccessToken('TEACHER'),
  gradesController.createGrades,
);

// 성적 조회
gradesRouter.get(
  '/students/:studentId',
  requireAccessToken('TEACHER'),
  gradesController.getGrades,
);

// 성적 수정
gradesRouter.patch(
  '/students/:studentId',
  requireAccessToken('TEACHER'),
  gradesController.updateGrades,
);
export { gradesRouter };
