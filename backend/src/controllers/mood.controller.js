import { Mood, Selection } from '../models/index.js'

export async function create(req, res, next) {
  try {
    const { selection_id, mood_emoji, mood_label, notes } = req.body

    const selection = await Selection.findByPk(selection_id)
    if (!selection) return res.status(404).json({ error: 'Selection not found' })

    const existing = await Mood.findOne({ where: { selection_id } })
    if (existing) return res.status(409).json({ error: 'Mood already registered for this selection' })

    const mood = await Mood.create({ selection_id, mood_emoji, mood_label, notes })
    res.status(201).json(mood)
  } catch (err) {
    next(err)
  }
}

export async function update(req, res, next) {
  try {
    const mood = await Mood.findByPk(req.params.id)
    if (!mood) return res.status(404).json({ error: 'Mood not found' })

    const { mood_emoji, mood_label, notes } = req.body
    await mood.update({ mood_emoji, mood_label, notes })
    res.json(mood)
  } catch (err) {
    next(err)
  }
}
