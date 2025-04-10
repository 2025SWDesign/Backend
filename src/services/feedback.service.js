import { NotFoundError } from '../errors/http.error.js';
import FeedbackRepository from '../repositories/feedback.repository.js';
import TeacherRepository from '../repositories/teacher.repository.js';

class FeedbackService {
  feedbackRepository = new FeedbackRepository();
  teacherRepository = new TeacherRepository();
  // 피드백 작성
  createFeedback = async (studentId, feedback, schoolYear) => {
    // 필요한 값 가져오기
    const validCategories = Object.values(FEEDBACK_CATEGORY);

    // 유효성 검사
    for (const item of feedback) {
      if (!item.category || !validCategories.includes(item.category)) {
        throw new BadRequestError(
          `카테고리가 없거나 유효하지 않은 카테고리입니다: ${item.category}`,
        );
      }
    }

    const hasRequiredData = studentId && feedback && schoolYear;
    if (!hasRequiredData) throw new NotFoundError('값을 불러오지 못했습니다.');

    const existedStudent =
      await this.feedbackRepository.getOneStudent(studentId);
    if (!existedStudent)
      throw new NotFoundError('해당 학생이 존재하지 않습니다.');

    const createdFeedback = await this.feedbackRepository.createFeedback(
      studentId,
      feedback,
      schoolYear,
    );
    return createdFeedback;
  };

  // 피드백 수정
  updateFeedback = async (studentId, feedback, schoolYear) => {
    // 필요한 값 가져오기
    const validCategories = Object.values(FEEDBACK_CATEGORY);

    // 유효성 검사
    for (const item of feedback) {
      if (!item.category || !validCategories.includes(item.category)) {
        throw new BadRequestError(
          `카테고리가 없거나 유효하지 않은 카테고리입니다: ${item.category}`,
        );
      }
    }

    const hasRequiredData = studentId && feedback && schoolYear;
    if (!hasRequiredData) throw new NotFoundError('값을 불러오지 못했습니다.');

    const existedStudent =
      await this.feedbackRepository.getOneStudent(studentId);
    if (!existedStudent)
      throw new NotFoundError('해당 학생이 존재하지 않습니다.');

    const updatedFeedback = await this.feedbackRepository.updateFeedback(
      studentId,
      feedback,
      schoolYear,
    );
    return updatedFeedback;
  };
  // 피드백 조회
  getFeedback = async (studentId, schoolYear) => {
    // 과목 or ( 학년, 학기 ) 중 어느 한쪽도 받지 못했다면 에러 반환
    if (!schoolYear) throw new NotFoundError('과목을 입력해주세요');

    // studentId에 맞는 학생이 없을 시, 에러 반환
    const existedStudent =
      await this.feedbackRepository.getOneStudent(studentId);
    if (!existedStudent) throw new Error('해당 학생이 존재하지 않습니다.');

    const feedback = await this.feedbackRepository.getFeedback(
      schoolYear,
      studentId,
    );
    return feedback;
  };
}

export default FeedbackService;
