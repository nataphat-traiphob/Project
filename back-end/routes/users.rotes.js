import express from "express";
import auth from '../middlewares/auth.js';
import { validate } from "../middlewares/validate.js";

import * as users from '../controllers/users.controller.js'
import * as validators from '../validators/user.schema.js'

const router = express.Router()
router.use(auth('admin'))

router.get('/',users.getUsers);
router.get('/:id',users.getUserById);
router.post('/',validate(validators.createUserSchema),users.createUser);
router.put('/:id',validate(validators.updateUserSchema),users.updateUser);
router.delete('/:id',users.deleteUser);

export default router