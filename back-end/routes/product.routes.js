import express from "express";
import auth from "../middlewares/auth.js";
import { requireImage } from "../middlewares/requireImage.js";
import { validate } from "../middlewares/validate.js";

import * as upload from '../middlewares/upload.js'
import * as validators from '../validators/product.schema.js'
import * as product from '../controllers/product.controller.js'

const router = express.Router()
router.use(auth('admin'))

router.get('/' , product.getProducts);
router.get('/:id' , product.getProductById);
router.post('/' , upload.single("pd_img") , validate(validators.createProductSchema) , requireImage , product.createProduct)
router.put('/:id' , upload.single("pd_img") , validate(validators.updateProductSchema) , product.updateProduct)
router.delete('/' , product.deleteProduct)