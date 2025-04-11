import { HTTP_STATUS } from '../constants/http-status.constant.js';
import UserService from '../services/user.service.js';



class UserController {
  userService = new UserService();

  // 담임 설정 및 반 생성
  assignHomeRoom = async (req, res, next) => {
    try {
      const userId = req.user.id;

      const { grade, gradeClass } = req.body;

      const data = await this.userService.assignHomeRoom(grade, gradeClass, userId);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '담임 설정 및 반 생성 성공',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  // 내 정보 조회
  getMyInfo = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const data = await this.userService.getMyInfo(userId);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '내 정보 조회 성공',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  // 내 비밀번호 수정
  updateMyPassword = async (req, res, next) => {
    try {
      const userId = req.user.id;

      const { currentPassword, newPassword } = req.body;

      const data = await this.userService.updateMyPassword(
        userId,
        currentPassword,
        newPassword,
      );

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '내 정보 수정 성공',
        data,
      });
    } catch (err) {
      next(err);
    }
  };
}

export default UserController;
