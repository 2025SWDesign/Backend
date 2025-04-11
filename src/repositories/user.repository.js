import { prisma } from "../utils/prisma.utils.js";

class UserRepository {
    // 반 or 담임 조회 (유효성 검증)
    findClass = async(grade, gradeClass) => {
        const data = await prisma.class.findFirst({
            where: {
                grade: grade,
                gradeClass: gradeClass,
            },
        });
        return data;
    }

    // 반 생성
    createClass = async(grade, gradeClass, teacherId) => {
        const data = await prisma.class.create({
            data: {
                grade,
                gradeClass,
                //반 테이블과 교사 테이블을 연결
                teacherId,
            },

            
        });
        return data;
    }


  // 내 정보 조회
  getUserById = async (userId) => {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      data: {
        name: true,
        ...(user.role === 'TEACHER' && {
          teacher: {
            include: {
              isHomeroom: true,
            },
          },
        }),
        school: {
          include: {
            schoolName: true,
          },
        },
      },
    });
    return user;
  };

  // 내 비밀번호 조회
  getUserPassword = async (userId) => {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        password: true,
      },
    });
    return user;
  };

  // 내 비밀번호 수정
  updateUserPassword = async (userId, password) => {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        password,
      },
    });
    return user;
  };
}
export default UserRepository;
