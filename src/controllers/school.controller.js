import { HTTP_STATUS } from '../constants/http-status.constant.js';
import SchoolService from '../services/school.service.js';

 
class SchoolController{
    schoolService = new SchoolService();

    // 학교 이름으로 학교 전체 목록 조회
    getAllSchool = async(req, res, next) => {
        try {
            const { schoolName } = req.body;

            const data = await this.schoolService.getAllSchool(schoolName);
            
            return res.status(HTTP_STATUS.OK).json({
                    status: HTTP_STATUS.OK,
                    message:"학교 전체 목록 조회 성공",
                    data
            });
        
        } catch (err) {
            next(err);
        }
    }
};
export default SchoolController;