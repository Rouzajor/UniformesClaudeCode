import { Router } from 'express'
import * as ctrl from '../controllers/stats.controller.js'

const router = Router()

router.get('/by-color', ctrl.byColor)
router.get('/by-weekday', ctrl.byWeekday)
router.get('/mood-color', ctrl.moodColor)

export default router
