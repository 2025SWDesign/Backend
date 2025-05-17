import { HTTP_STATUS } from '../constants/http-status.constant.js';

// export const globalErrorHandler = (err, req, res, next) => {
//   // log Error
//   console.error(err.stack);

//   if (err instanceof Error && err.statusCode) {
//     return res.status(err.statusCode).json({
//       status: err.statusCode,
//       message: err.message,
//     });
//   }

//   if (err instanceof Error && err.name === 'ValidationError') {
//     return res.status(HTTP_STATUS.BAD_REQUEST).json({
//       status: HTTP_STATUS.BAD_REQUEST,
//       message: err.message,
//     });
//   }

//   return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
//     status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
//     message: '예상치 못한 에러가 발생하였습니다.',
//   });
// };
export const globalErrorHandler = (err, req, res, next) => {
  console.error('[GlobalErrorHandler]', err.stack);

  // 💡 err 가공: 상태 코드와 메시지를 붙여서 다음 핸들러로 넘김
  if (err instanceof Error && err.statusCode) {
    err.status = err.statusCode;
  } else if (err instanceof Error && err.name === 'ValidationError') {
    err.status = HTTP_STATUS.BAD_REQUEST;
    err.message = err.message || '입력값이 유효하지 않습니다.';
  } else {
    err.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    err.message = '예상치 못한 에러가 발생하였습니다.';
  }
  console.log('test');
  next(err); //
};
