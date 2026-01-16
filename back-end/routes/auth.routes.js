import express from 'express';
import {validate} from '../middlewares/validate.js'

import * as validators from '../validators/auth.schema.js'
import * as auth from '../controllers/auth.controller.js'
const router = express.Router ()

router.post('/login', validate(validators.LoginSchema) , auth.Login);
router.post('/register', validate(validators.RegisterSchema) , auth.Register);

export default router