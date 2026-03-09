import { Uniform } from '../models/index.js'

export async function getAll(req, res, next) {
  try {
    const uniforms = await Uniform.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']],
    })
    res.json(uniforms)
  } catch (err) {
    next(err)
  }
}

export async function create(req, res, next) {
  try {
    const { name, hex_color } = req.body
    const uniform = await Uniform.create({ name, hex_color })
    res.status(201).json(uniform)
  } catch (err) {
    next(err)
  }
}

export async function update(req, res, next) {
  try {
    const uniform = await Uniform.findByPk(req.params.id)
    if (!uniform) return res.status(404).json({ error: 'Uniform not found' })

    const { name, hex_color } = req.body
    await uniform.update({ name, hex_color })
    res.json(uniform)
  } catch (err) {
    next(err)
  }
}

export async function deactivate(req, res, next) {
  try {
    const uniform = await Uniform.findByPk(req.params.id)
    if (!uniform) return res.status(404).json({ error: 'Uniform not found' })

    await uniform.update({ is_active: false })
    res.json({ message: 'Uniform deactivated' })
  } catch (err) {
    next(err)
  }
}
