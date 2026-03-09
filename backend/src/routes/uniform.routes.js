import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import * as ctrl from '../controllers/uniform.controller.js'

const router = Router()

const uniformRules = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('hex_color')
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('hex_color must be a valid hex color (e.g. #FFFFFF)'),
]

router.get('/', ctrl.getAll)
router.post('/', uniformRules, validate, ctrl.create)
router.put('/:id', uniformRules, validate, ctrl.update)
router.delete('/:id', ctrl.deactivate)

export default router
