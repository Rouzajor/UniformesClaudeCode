import { Op } from 'sequelize'
import { Selection, Uniform, Mood } from '../models/index.js'

export async function getHistory(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, parseInt(req.query.limit) || 10)
    const offset = (page - 1) * limit

    const { count, rows } = await Selection.findAndCountAll({
      include: [
        { model: Uniform, as: 'uniform' },
        { model: Mood, as: 'mood' },
      ],
      order: [['selected_date', 'DESC']],
      limit,
      offset,
    })

    res.json({
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      data: rows,
    })
  } catch (err) {
    next(err)
  }
}

export async function getToday(req, res, next) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const selection = await Selection.findOne({
      where: { selected_date: today },
      include: [
        { model: Uniform, as: 'uniform' },
        { model: Mood, as: 'mood' },
      ],
    })
    if (!selection) return res.status(404).json({ error: 'No selection for today' })
    res.json(selection)
  } catch (err) {
    next(err)
  }
}

export async function create(req, res, next) {
  try {
    const today = new Date().toISOString().split('T')[0]

    const existing = await Selection.findOne({ where: { selected_date: today } })
    if (existing) {
      return res.status(409).json({ error: 'A selection already exists for today' })
    }

    const uniform = await Uniform.findOne({
      where: { id: req.body.uniform_id, is_active: true },
    })
    if (!uniform) return res.status(404).json({ error: 'Uniform not found or inactive' })

    const selection = await Selection.create({
      uniform_id: req.body.uniform_id,
      selected_date: today,
    })

    res.status(201).json(selection)
  } catch (err) {
    next(err)
  }
}
