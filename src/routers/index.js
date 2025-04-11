import express from 'express';
import { authRouter } from './auth.router.js';
import { studentsRouter } from './students.router.js';
import { studentRecordRouter } from './student-record.router.js';
import { gradesRouter } from './grades.router.js';
import { feedbackRouter } from './feedback.router.js';
import { consultationRouter } from './consultation.router.js';
import { schoolRouter } from './school.router.js';
import { userRouter } from './user.router.js';

const apiRouter = express.Router();

// 인증 라우터
apiRouter.use('/api/v1/auth', authRouter);

// 학생 관리 라우터
apiRouter.use('/api/v1/school/:schoolId', studentsRouter);

// 학생부( 출결 / 상세정보 ) 라우터
apiRouter.use('/api/v1/school/:schoolId/student-record', studentRecordRouter);

// 성적 라우터
apiRouter.use('/api/v1/school/:schoolId/grades', gradesRouter);

// 피드백 라우터
apiRouter.use('/api/v1/school/:schoolId/feedback', feedbackRouter);

// 상담 라우터
apiRouter.use('/api/v1/school/:schoolId/consultation', consultationRouter);

// 유저 라우터
apiRouter.use('/api/v1/school/:schoolId/users', userRouter);

// 학교 라우터
apiRouter.use('/api/v1/school', schoolRouter);

export { apiRouter };
