import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import * as ctrl from '../controllers/mood.controller.js'

const router = Router()

const moodCreateRules = [
  body('selection_id').isInt({ min: 1 }).withMessage('selection_id must be a positive integer'),
  body('mood_emoji').trim().notEmpty().withMessage('mood_emoji is required'),
  body('mood_label').trim().notEmpty().withMessage('mood_label is required'),
  body('notes').optional().isString(),
]

const moodUpdateRules = [
  body('mood_emoji').trim().notEmpty().withMessage('mood_emoji is required'),
  body('mood_label').trim().notEmpty().withMessage('mood_label is required'),
  body('notes').optional().isString(),
]

router.post('/', moodCreateRules, validate, ctrl.create)
router.put('/:id', moodUpdateRules, validate, ctrl.update)

export default router
