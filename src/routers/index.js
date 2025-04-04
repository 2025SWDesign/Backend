import express from 'express';
import { authRouter } from './auth.router.js';
import { studentsRouter } from './students.router.js';
import { studentRecordRouter } from './student-record.router.js';
import { gradesRouter } from './grades.router.js';
import { feedbackRouter } from './feedback.router.js';
import { consultationRouter } from './consultation.router.js';

const apiRouter = express.Router();

// 인증 라우터
apiRouter.use('/api/v1/auth', authRouter);

// 학생 관리 라우터
apiRouter.use('/api/v1/students', studentsRouter);

// 학생부( 출결 / 상세정보 ) 라우터
apiRouter.use('/api/v1/student-record', studentRecordRouter);

// 성적 라우터
apiRouter.use('/api/v1/grades', gradesRouter);

// 피드백 라우터
apiRouter.use('/api/v1/feedback', feedbackRouter);

// 상담 라우터
apiRouter.use('/api/v1/consultation', consultationRouter);

// 유저 라우터
apiRouter.use('/api/v1/users');

export { apiRouter };
