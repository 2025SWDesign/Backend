import { BadRequestError, NotFoundError } from '../errors/http.error.js';
import FeedbackRepository from '../repositories/feedback.repository.js';
import StudentsRepository from '../repositories/students.repository.js';
import TeacherRepository from '../repositories/teacher.repository.js';
import { FEEDBACK_CATEGORY } from '../constants/enum.constant.js';
import { sendEmail } from '../utils/send-email.util.js';
import ParentsRepository from '../repositories/parents.repository.js';

class FeedbackService {
  feedbackRepository = new FeedbackRepository();
  teacherRepository = new TeacherRepository();
  studentRepository = new StudentsRepository();
  parentRepository = new ParentsRepository();

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
      const existedFeedback = await this.feedbackRepository.getFeedbackDetail(
        schoolYear,
        studentId,
        item.category,
      );
      if (existedFeedback)
        throw new BadRequestError(
          `이미 존재하는 피드백입니다: ${item.category}`,
        );
    }

    const hasRequiredData = studentId && feedback && schoolYear;
    if (!hasRequiredData) throw new NotFoundError('값을 불러오지 못했습니다.');

    const existedStudent =
      await this.studentRepository.getOneStudent(studentId);
    if (!existedStudent)
      throw new NotFoundError('해당 학생이 존재하지 않습니다.');

    const createdFeedback = await this.feedbackRepository.createFeedback(
      studentId,
      feedback,
      schoolYear,
      existedStudent.user.id,
    );
    sendEmail(
      existedStudent.user.email,
      '[피드백 알림] 피드백 입력이 완료되었습니다.',
      `${existedStudent.user.name}님의 ${schoolYear}학년 피드백 입력이 완료되었습니다.`,
    ).catch((err) => {
      console.error('이메일 전송 실패:', err);
    });
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
      if (!item.updatedAt) {
        throw new BadRequestError(`업데이트 날짜가 없습니다: ${item.category}`);
      }
    }

    const hasRequiredData = studentId && feedback && schoolYear;
    if (!hasRequiredData) throw new NotFoundError('값을 불러오지 못했습니다.');

    const existedStudent =
      await this.studentRepository.getOneStudent(studentId);
    if (!existedStudent)
      throw new NotFoundError('해당 학생이 존재하지 않습니다.');

    const updatedFeedback = await this.feedbackRepository.updateFeedback(
      studentId,
      feedback,
      schoolYear,
      existedStudent.user.id,
    );
    return updatedFeedback;
  };
  // 피드백 조회
  getFeedback = async (studentId, schoolYear) => {
    // 과목 or ( 학년, 학기 ) 중 어느 한쪽도 받지 못했다면 에러 반환
    if (!schoolYear) throw new NotFoundError('과목을 입력해주세요');

    // studentId에 맞는 학생이 없을 시, 에러 반환
    const existedStudent =
      await this.studentRepository.getOneStudent(studentId);
    if (!existedStudent) throw new Error('해당 학생이 존재하지 않습니다.');

    const feedback = await this.feedbackRepository.getFeedback(
      schoolYear,
      studentId,
    );
    return feedback;
  };

  // 피드백 조회 ( 학생 )
  getMyFeedback = async (userId, schoolYear) => {
    const hasRequiredData = userId && schoolYear;
    if (!hasRequiredData) throw new NotFoundError('값을 불러오지 못했습니다.');

    const student = await this.studentRepository.getStudentByUserId(userId);
    if (!student) throw new NotFoundError('해당 학생이 존재하지 않습니다.');

    const getMyFeedback = await this.feedbackRepository.getMyFeedback(
      student.studentId,
      schoolYear,
    );

    return getMyFeedback;
  };

  // 피드백 조회 (학부모)
  getChildFeedback = async (schoolYear, userId) => {
    const hasRequiredData = userId && schoolYear;
    if (!hasRequiredData) throw new NotFoundError('값을 불러오지 못했습니다.');

    const parent = await this.parentRepository.getParentsByUserId(userId);
    if (!parent) throw new NotFoundError('해당 학부모가 존재하지 않습니다.');
    const parentsId = parent.parentsId;

    const student =
      await this.studentRepository.getStudentByParentId(parentsId);
    if (!student) throw new NotFoundError('해당 학생이 존재하지 않습니다.');

    const getMyFeedback = await this.feedbackRepository.getMyFeedback(
      student.studentId,
      schoolYear,
    );

    return getMyFeedback;
  };
}

export default FeedbackService;
