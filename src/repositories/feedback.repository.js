import { BadRequestError } from '../errors/http.error.js';
import { prisma } from '../utils/prisma.utils.js';

class FeedbackRepository {
  // 피드백 작성
  createFeedback = async (studentId, feedback, schoolYear, studentUserId) => {
    const feedbackWithMeta = feedback.map((item) => ({
      ...item,
      studentId,
      schoolYear,
    }));

    const createdFeedback = await prisma.feedback.createMany({
      data: feedbackWithMeta,
    });
    const notification = await prisma.notification.create({
      data: {
        userId: studentUserId,
        type: 'FEEDBACK',
        message: `${schoolYear}학년 생성`,
      },
    });
    return createdFeedback;
  };
  // 피드백 수정
  updateFeedback = async (studentId, feedback, schoolYear, studentUserId) => {
    await prisma.$transaction(async (tx) => {
      const results = await Promise.all(
        feedback.map((item) =>
          tx.feedback.updateMany({
            where: {
              studentId,
              schoolYear,
              category: item.category,
              updatedAt: item.updatedAt, // 낙관적 락용
            },
            data: {
              content: item.content,
            },
          }),
        ),
      );
      //  하나라도 수정되지 않았다면 트랜잭션 전체 취소
      const failed = results.find((res) => res.count === 0);
      if (failed) {
        throw new BadRequestError('다른 탭 혹은 창에서 이미 수정되었습니다.');
      }
    });

    const notification = await prisma.notification.create({
      data: {
        userId: studentUserId,
        type: 'FEEDBACK',
        message: `${schoolYear}학년 생성`,
      },
    });

    return;
  };
  // 피드백 조회
  getFeedback = async (schoolYear, studentId) => {
    const feedback = await prisma.feedback.findMany({
      where: {
        schoolYear,
        studentId,
      },
      select: {
        schoolYear: true,
        category: true,
        content: true,
        updatedAt: true,
      },
    });
    return feedback;
  };

  // 피드백 상세 조회
  getFeedbackDetail = async (schoolYear, studentId, category) => {
    const feedback = await prisma.feedback.findFirst({
      where: {
        schoolYear,
        studentId,
        category,
      },
    });
    return feedback;
  };

  // 피드백 조회 ( 학생 / 학부모 )
  getMyFeedback = async (studentId, schoolYear) => {
    const feedback = await prisma.feedback.findMany({
      where: {
        studentId,
        schoolYear,
      },
      select: {
        schoolYear: true,
        category: true,
        content: true,
        updatedAt: true,
        student: {
          select: {
            studentId: true,
            user: {
              select: {
                name: true,
                loginId: true,
                email: true,
              },
            },
          },
        },
      },
    });
    return feedback;
  };
}

export default FeedbackRepository;
