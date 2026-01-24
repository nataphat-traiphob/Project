import express from "express";
import auth from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

import * as validators from '../validators/discount.schema.js'
import * as discount from '../controllers/discount.controller.js'

const router = express.Router()
router.use(auth('admin'))

router.get('/' , discount.getProductDiscounts);
router.get('/:id' , discount.getProductDiscountById);
router.post('/' , validate(validators.createProductDiscountSchema)  , discount.createProductDiscount)
router.put('/:id' ,  validate(validators.updateProductDiscountSchema) , discount.updateProductDiscount)
router.delete('/:id' , discount.deleteProductDiscount)
export default router 