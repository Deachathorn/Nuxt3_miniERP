const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const Joi = require("joi")

const materialSchema = Joi.object({
    name: Joi.string().required(),
    unit: Joi.string().required(),
    price: Joi.number().integer().greater(0).required(),
    remark: Joi.any().optional()
})

const createSchema = materialSchema
const updateSchema = materialSchema

module.exports = {
    list: async (req, res) => {
        try {
            const materials = await prisma.material.findMany({
                where: {
                    status: "active"
                },
                orderBy: {
                    createdAt: 'asc'
                },
                include: {
                    StockMaterial: true
                }
            })
            res.json({ results: materials })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },
    create: async (req, res) => {
        try {
            await createSchema.validateAsync(req.body, {abortEarly: false})
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }

        try {
            await prisma.material.create({
                data: {
                    name: req.body.name,
                    unit: req.body.unit,
                    price: req.body.price,
                    remark: req.body.remark
                }
            })
            res.json({ message: 'success' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },
    update: async (req, res) => {
        try {
            await updateSchema.validateAsync(req.body, {abortEarly: false})
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }

        try {
            await prisma.material.update({
                where: {
                    id: req.params.id
                },
                data: {
                    name: req.body.name,
                    unit: req.body.unit,
                    price: req.body.price,
                    remark: req.body.remark
                }
            })
            res.json({ message: 'success' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },
    remove: async (req, res) => {
        try {
            await prisma.material.update({
                where: {
                    id: req.params.id
                },
                data: {
                    status: "inactive"
                }
            })
            res.json({ message: 'success' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}