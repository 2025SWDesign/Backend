import express from 'express';
import UserRepository from '../repositories/user.repository.js';
import { prisma } from '../utils/prisma.utils.js';
import UserService from '../services/user.service.js';
import UserController from '../controllers/user.controller.js';

const userRouter = express.Router();
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// 담임 설정 및 반 생성
userRouter.post('/assign-homeroom', userController.assignHomeRoom);

export { userRouter };
