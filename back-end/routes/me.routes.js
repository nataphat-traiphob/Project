import express from "express";

import auth from '../middlewares/auth.js'
import { validate } from "../middlewares/validate.js";

import * as validators from "../validators/me.schema.js"
import * as me from '../controllers/me.controller.js'

const router = express.Router()
router.use(auth())

router.get('/' , me.getMe)
router.put('/' , validate(validators.updateUserSchema) , me.updateMe)
router.delete('/', me.deleteMe)

export default router