import express from "express";
import auth from "../middlewares/auth.js";
import { requireImage } from "../middlewares/requireImage.js";
import { validate } from "../middlewares/validate.js";

import * as upload from '../middlewares/upload.js'
import * as validators from '../validators/announcement.schema.js'
import * as announcement from '../controllers/announcement.controller.js'

const router = express.Router()
router.use(auth('admin'))

router.get('/' , announcement.getAnnouncements);
router.get('/:id' , announcement.getAnnouncementById);
router.post('/' , upload.uploadProductImage.single("annc_img") , validate(validators.createAnnouncementSchema) , requireImage , announcement.createAnnouncement)
router.put('/:id' , upload.uploadProductImage.single("annc_img") , validate(validators.updateAnnouncementSchema) , announcement.updateAnnouncement)
router.delete('/' , announcement.deleteAnnouncement)

export default router