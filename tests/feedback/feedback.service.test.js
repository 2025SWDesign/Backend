import { describe, test, expect, vi, beforeEach } from 'vitest';
import FeedbackService from '../../src/services/feedback.service.js';
import { FEEDBACK_CATEGORY } from '../../src/constants/enum.constant.js';

vi.mock('../../src/repositories/feedback.repository.js', () => ({
  default: class {
    getFeedbackDetail = vi.fn();
    createFeedback = vi.fn();
    updateFeedback = vi.fn();
  },
}));

vi.mock('../../src/repositories/students.repository.js', () => ({
  default: class {
    getOneStudent = vi.fn();
  },
}));

describe('FeedbackService - createFeedback()', () => {
  let feedbackService;

  beforeEach(() => {
    feedbackService = new FeedbackService();
  });

  test('✅ 정상 입력 시 피드백 생성 성공', async () => {
    const studentId = 1;
    const schoolYear = 2025;
    const feedback = [
      { category: FEEDBACK_CATEGORY.BEHAVIOR, content: '수업 태도가 좋음' },
    ];

    feedbackService.feedbackRepository.getFeedbackDetail = vi
      .fn()
      .mockResolvedValue(null);
    feedbackService.studentRepository.getOneStudent = vi
      .fn()
      .mockResolvedValue({
        user: { id: 99 },
      });
    feedbackService.feedbackRepository.createFeedback = vi
      .fn()
      .mockResolvedValue('생성됨');

    const result = await feedbackService.createFeedback(
      studentId,
      feedback,
      schoolYear,
    );
    expect(result).toBe('생성됨');
  });

  test('❌ 중복 피드백이 있을 경우 ConflictError 발생', async () => {
    feedbackService.feedbackRepository.getFeedbackDetail = vi
      .fn()
      .mockResolvedValue(true);

    const feedback = [
      { category: FEEDBACK_CATEGORY.BEHAVIOR, content: '중복 내용' },
    ];

    await expect(
      feedbackService.createFeedback(1, feedback, 2025),
    ).rejects.toThrow('이미 존재하는 피드백입니다');
  });

  test('❌ 존재하지 않는 학생일 경우 NotFoundError 발생', async () => {
    feedbackService.feedbackRepository.getFeedbackDetail = vi
      .fn()
      .mockResolvedValue(null);
    feedbackService.studentRepository.getOneStudent = vi
      .fn()
      .mockResolvedValue(null);

    const feedback = [
      { category: FEEDBACK_CATEGORY.ATTITUDE, content: '성실함' },
    ];

    await expect(
      feedbackService.createFeedback(999, feedback, 2025),
    ).rejects.toThrow('해당 학생이 존재하지 않습니다.');
  });
});

describe('FeedbackService - updateFeedback()', () => {
  let feedbackService;

  beforeEach(() => {
    feedbackService = new FeedbackService();
    // 🟢 추가된 부분: 학생 존재 mock
    feedbackService.studentRepository.getOneStudent = vi
      .fn()
      .mockResolvedValue({ user: { id: 1 } });
  });

  test('✅ 피드백이 존재하면 정상적으로 수정된다', async () => {
    const studentId = 1;
    const schoolYear = 2025;
    const feedback = [
      { category: FEEDBACK_CATEGORY.BEHAVIOR, content: '태도가 더 좋아짐' },
    ];

    feedbackService.feedbackRepository.getFeedbackDetail = vi
      .fn()
      .mockResolvedValue([{ category: FEEDBACK_CATEGORY.BEHAVIOR }]);
    feedbackService.feedbackRepository.updateFeedback = vi
      .fn()
      .mockResolvedValue('수정됨');

    const result = await feedbackService.updateFeedback(
      studentId,
      feedback,
      schoolYear,
    );
    expect(result).toBe('수정됨');
  });

  test('❌ 피드백이 존재하지 않으면 NotFoundError 발생', async () => {
    feedbackService.feedbackRepository.getFeedbackDetail = vi
      .fn()
      .mockResolvedValue([]);

    const feedback = [
      { category: FEEDBACK_CATEGORY.ATTITUDE, content: '노력함' },
    ];

    await expect(
      feedbackService.updateFeedback(1, feedback, 2025),
    ).rejects.toThrow('해당 피드백이 존재하지 않습니다.');
  });
});

describe('FeedbackService - getMyFeedback()', () => {
  let feedbackService;

  beforeEach(() => {
    feedbackService = new FeedbackService();
  });

  test('✅ 피드백이 존재하면 정상적으로 반환한다', async () => {
    const userId = 1;
    const schoolYear = 2025;

    feedbackService.studentRepository.getStudentByUserId = vi
      .fn()
      .mockResolvedValue({ studentId: 1 });
    feedbackService.feedbackRepository.getMyFeedback = vi
      .fn()
      .mockResolvedValue([{ category: 'BEHAVIOR', content: '좋음' }]);

    const result = await feedbackService.getMyFeedback(userId, schoolYear);
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('BEHAVIOR');
  });

  test('❌ 피드백이 존재하지 않으면 NotFoundError 발생', async () => {
    const userId = 1;
    const schoolYear = 2025;

    feedbackService.studentRepository.getStudentByUserId = vi
      .fn()
      .mockResolvedValue({ studentId: 1 });
    feedbackService.feedbackRepository.getMyFeedback = vi
      .fn()
      .mockResolvedValue([]); // ← 빈 배열

    await expect(
      feedbackService.getMyFeedback(userId, schoolYear),
    ).rejects.toThrow('해당 피드백이 존재하지 않습니다.');
  });

  test('❌ 존재하지 않는 학생이면 NotFoundError 발생', async () => {
    feedbackService.studentRepository.getStudentByUserId = vi
      .fn()
      .mockResolvedValue(null);

    await expect(feedbackService.getMyFeedback(999, 2025)).rejects.toThrow(
      '해당 학생이 존재하지 않습니다.',
    );
  });

  test('❌ 입력 값이 없으면 NotFoundError 발생', async () => {
    await expect(feedbackService.getMyFeedback(null, null)).rejects.toThrow(
      '값을 불러오지 못했습니다.',
    );
  });
});
