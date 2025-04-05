import SchoolRepository from "../repositories/school.repository.js";

class SchoolService{
    schoolRepository = new SchoolRepository();

    // 학교 이름으로 학교 전체 목록 조회
    getAllSchool = async(schoolName) => {
        const school = await this.schoolRepository.findSchoolBySchoolName(schoolName);
        return school;
    };
};
export default SchoolService;