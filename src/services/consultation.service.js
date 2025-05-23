import { BadRequestError } from '../errors/http.error.js';
import { NotFoundError } from '../errors/http.error.js';
import ConsultationRepository from '../repositories/consultation.repository.js';
import StudentsRepository from '../repositories/students.repository.js';
import TeacherRepository from '../repositories/teacher.repository.js';
import { sendEmail } from '../utils/send-email.util.js';

class ConsultationService {
  consultationRepository = new ConsultationRepository();
  teacherRepository = new TeacherRepository();
  studentRepository = new StudentsRepository();

  // 특정 학생 상담 내역 전체 조회
  getAllConsultation = async (studentId) => {
    // studentId에 맞는 학생이 없을 시, 에러 반환
    const existedStudent =
      await this.studentRepository.getOneStudent(studentId);
    if (!existedStudent)
      throw new NotFoundError('해당 학생이 존재하지 않습니다.');

    const data =
      await this.consultationRepository.getAllConsultation(studentId);
    return data;
  };

  // 특정 기준 별 상담 내역 조회 (기간, 과목, 제목, 작성자)
  getConsultation = async (date, subject, title, author, studentId) => {
    // studentId에 맞는 학생이 없을 시, 에러 반환
    const existedStudent =
      await this.studentRepository.getOneStudent(studentId);
    if (!existedStudent)
      throw new NotFoundError('해당 학생이 존재하지 않습니다.');

    //특정 기간 별 상담 내역 조회
    if (date) {
      const data = await this.consultationRepository.getConsultationByDate(
        studentId,
        date,
      );
      return data;
    }

    //특정 과목 별 상담 내역 조회
    if (subject) {
      const data = await this.consultationRepository.getConsultationBySubject(
        studentId,
        subject,
      );
      return data;
    }

    //특정 제목 별 상담 내역 조회
    else if (title) {
      const data = await this.consultationRepository.getConsultationByTitle(
        studentId,
        title,
      );
      return data;
    }

    //특정 작성자 별 상담 내역 조회
    else if (author) {
      const data = await this.consultationRepository.getConsultationByAuthor(
        studentId,
        author,
      );
      return data;
    }
  };

  //상담 기록 조회
  getConsultationContent = async (studentId, consultationId) => {
    // studentId에 맞는 학생이 없을 시, 에러 반환
    const existedStudent =
      await this.studentRepository.getOneStudent(studentId);
    if (!existedStudent)
      throw new NotFoundError('해당 학생이 존재하지 않습니다.');

    const data = await this.consultationRepository.getConsultationContent({
      studentId,
      consultationId,
    });
    return data;
  };

  //상담 기록 입력
  createConsultation = async (
    title,
    content,
    date,
    nextPlan,
    isPublicToSubject,
    studentId,
    userId,
  ) => {
    // 요청 값이 제대로 들어오지 않았다면 에러 반환
    if (!title || !content || !date || !nextPlan) {
      throw new BadRequestError('요청 값이 제대로 들어오지 않았습니다.');
    }

    // 예정일이 상담일자보다 빠르면 에러 반환
    if (new Date(nextPlan) <= new Date(date)) {
      throw new BadRequestError('상담일은 예정일보다 이전이어야 합니다.');
    }

    // 상담글이 이미 존재하면 에러 반환
    const existedConsultation =
      await this.consultationRepository.findExistedConsultation(
        studentId,
        title,
        date,
      );
    if (existedConsultation)
      throw new BadRequestError('이미 존재하는 상담글입니다.');

    // 유저 ID를 통해 선생님 이름, 과목, id 값을 가져오기
    const teacher = await this.teacherRepository.findTeacherByUserId(userId);
    const subject = teacher.subject;
    const author = teacher.user.name;
    const teacherId = teacher.teacherId;

    // 학생 ID에 맞는 학생이 없다면 에러 반환
    const existedStudent =
      await this.studentRepository.getOneStudent(studentId);
    if (!existedStudent)
      throw new NotFoundError('해당 학생이 존재하지 않습니다.');

    const data = await this.consultationRepository.create(
      title,
      content,
      date,
      nextPlan,
      isPublicToSubject,
      subject,
      author,
      studentId,
      teacherId,
      existedStudent.user.id,
    );
    sendEmail(
      existedStudent.user.email,
      '[상담 알림] 상담 입력이 완료되었습니다.',
      `${existedStudent.user.name}님의 ${date}날의 상담 입력이 완료되었습니다.`,
    ).catch((err) => {
      console.error('이메일 전송 실패:', err);
    });
    return data;
  };

  // // 상담 내용 수정
  // updateConsultation = async (
  //   title,
  //   content,
  //   date,
  //   nextPlan,
  //   studentId,
  //   consultationId,
  //   userId,
  // ) => {
  //   const teacher = await this.teacherRepository.findTeacherByUserId(userId);
  //   const teacherName = teacher.user.name;
  //   const teacherId = teacher.teacherId;

  //   const data = await this.consultationRepository.update({
  //     title,
  //     content,
  //     date,
  //     nextPlan,
  //     studentId,
  //     consultationId,
  //     teacherId,
  //   });
  //   return {
  //     ...data,
  //     teacherName,
  //   };
  // };
}

export default ConsultationService;
