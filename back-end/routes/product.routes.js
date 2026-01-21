import express from "express";
import auth from "../middlewares/auth.js";
import { requireImage } from "../middlewares/requireImage.js";
import { validate } from "../middlewares/validate.js";

import {uploadProductImage} from '../middlewares/upload.js'
import * as validators from '../validators/product.schema.js'
import * as product from '../controllers/product.controller.js'

const router = express.Router()
router.use(auth('admin'))

router.get('/' , product.getProducts);
router.get('/:id' , product.getProductById);
router.post('/' , uploadProductImage.single("pd_img") , requireImage , validate(validators.createProductSchema)  , product.createProduct)
router.put('/:id' , uploadProductImage.single("pd_img") , validate(validators.updateProductSchema) , product.updateProduct)
router.delete('/' , product.deleteProduct)

export default router 