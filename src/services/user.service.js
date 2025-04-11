import { ConflictError } from '../errors/http.error.js';
import { MESSAGES } from '../constants/message.constant.js';
import { NotFoundError } from '../errors/http.error.js';
import UserRepository from '../repositories/user.repository.js';
import TeacherRepository from '../repositories/teacher.repository.js';

class UserService {
  userRepository = new UserRepository();
  teacherRepository = new TeacherRepository();

  // 담임 설정 및 반 생성
  assignHomeRoom = async (grade, gradeClass, userId) => {
    // 반에 담임이 이미 존재한다면 에러 반환
    const existedClass = await this.userRepository.findClass(grade,gradeClass);
    if (existedClass) {
      throw new ConflictError("이미 담임이 존재하는 반입니다.");
    }

    // 유저 id로 선생 id를 가져오기
    const teacher = await this.teacherRepository.findTeacherByUserId(userId);
    const teacherId = teacher.teacherId;

    const data = await this.userRepository.createClass(grade,gradeClass,teacherId);
    return data;
  
  // 내 정보 조회
  getMyInfo = async (userId) => {
    const user = await this.userRepository.getUserById(userId);
    if (!user) throw new Error('유저를 찾을 수 없습니다.');
    return user;
  };

  // 내 비밀번호 수정
  updateMyPassword = async (userId, currentPassword, newPassword) => {
    const userPassword = await this.userRepository.getUserPassword(userId);
    if (!userPassword) throw new NotFoundError('유저를 찾을 수 없습니다.');

    const passwordCheck =
      user && bcrypt.compareSync(currentPassword, userPassword);
    if (!passwordCheck) {
      throw new UnauthorizedError(MESSAGES.AUTH.COMMON.UNAUTHORIZED);
    }
    const updatedUser = await this.userRepository.updateMyPassword(
      userId,
      newPassword,
    );
    if (!updatedUser) throw new Error('유저를 찾을 수 없습니다.');
    return updatedUser;
  };
}
}
export default UserService;
