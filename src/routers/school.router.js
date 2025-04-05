import express from 'express';
import SchoolRepository from '../repositories/school.repository.js';
import { prisma } from '../utils/prisma.utils.js';
import SchoolController from '../controllers/school.controller.js';
import SchoolService from '../services/school.service.js';




const schoolRouter = express.Router();
const schoolRepository = new SchoolRepository(prisma);
const schoolController = new SchoolController(SchoolService);
const schoolService = new SchoolService(schoolRepository);



// 학교 이름으로 학교 전체 목록 조회
schoolRouter.get('/', schoolController.getAllSchool);

export { schoolRouter };
