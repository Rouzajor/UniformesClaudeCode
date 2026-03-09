import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import * as ctrl from '../controllers/selection.controller.js'

const router = Router()

const selectionRules = [
  body('uniform_id').isInt({ min: 1 }).withMessage('uniform_id must be a positive integer'),
]

router.get('/', ctrl.getHistory)
router.get('/today', ctrl.getToday)
router.post('/', selectionRules, validate, ctrl.create)

export default router
