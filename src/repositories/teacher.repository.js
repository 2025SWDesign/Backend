import {prisma} from '../utils/prisma.utils.js';

class TeacherRepository {
  // 선생님 조회
  findTeacherByUserId = async (userId) => {
    const data = await prisma.teacher.findUnique({
      where: {
        userId,
      },
    });
    return data;
  };
}

export default TeacherRepository;
