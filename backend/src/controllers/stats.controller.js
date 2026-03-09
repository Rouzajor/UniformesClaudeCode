import { sequelize, Uniform, Selection, Mood } from '../models/index.js'
import { fn, col, literal } from 'sequelize'

export async function byColor(req, res, next) {
  try {
    const results = await Selection.findAll({
      attributes: [
        'uniform_id',
        [fn('COUNT', col('Selection.id')), 'count'],
      ],
      include: [{ model: Uniform, as: 'uniform', attributes: ['name', 'hex_color'] }],
      group: ['uniform_id', 'uniform.id'],
      order: [[literal('count'), 'DESC']],
    })
    res.json(results)
  } catch (err) {
    next(err)
  }
}

export async function byWeekday(req, res, next) {
  try {
    const results = await Selection.findAll({
      attributes: [
        'day_of_week',
        'uniform_id',
        [fn('COUNT', col('Selection.id')), 'count'],
      ],
      include: [{ model: Uniform, as: 'uniform', attributes: ['name', 'hex_color'] }],
      group: ['day_of_week', 'uniform_id', 'uniform.id'],
      order: ['day_of_week', [literal('count'), 'DESC']],
    })

    // Keep only the top uniform per weekday
    const topByDay = {}
    for (const row of results) {
      const day = row.day_of_week
      if (!topByDay[day]) topByDay[day] = row
    }

    res.json(Object.values(topByDay))
  } catch (err) {
    next(err)
  }
}

export async function moodColor(req, res, next) {
  try {
    const results = await Mood.findAll({
      attributes: [
        'mood_label',
        [fn('COUNT', col('Mood.id')), 'count'],
      ],
      include: [
        {
          model: Selection,
          as: 'selection',
          attributes: ['uniform_id'],
          include: [{ model: Uniform, as: 'uniform', attributes: ['name', 'hex_color'] }],
        },
      ],
      group: ['mood_label', 'selection.id', 'selection.uniform_id', 'selection->uniform.id'],
      order: [[literal('count'), 'DESC']],
    })
    res.json(results)
  } catch (err) {
    next(err)
  }
}
