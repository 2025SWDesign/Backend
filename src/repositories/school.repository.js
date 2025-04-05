import { prisma } from '../utils/prisma.utils.js';
class SchoolRepository {
  // 학교 이름으로 학교 정보 조회
  findSchoolBySchoolName = async (schoolName) => {
    const data = await prisma.school.findMany({
      where: {
        schoolName:{
          // 입력 문자열이 학교 이름에 포함되어 있는 데이터를 모두 가져오기
          contains: schoolName, 
        }
      },
    });
    return data;
  };
}

export default SchoolRepository;
