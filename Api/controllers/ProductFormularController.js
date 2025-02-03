const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const Joi = require('joi')

const formularSchema = Joi.object({
    quantity: Joi.number().greater(0).required(),
    remark: Joi.any().optional()
}).unknown(true)

const createSchema = formularSchema
const updateSchema = formularSchema

module.exports = {
    create: async (req, res) => {
        try {
            await createSchema.validateAsync(req.body, {abortEarly: false})
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }

        try {
            await prisma.productFormular.create({
                data: req.body,
            })
            res.json({ message: 'success' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },
    list: async (req, res) => {
        try {
            const formulars = await prisma.productFormular.findMany({
                include: {
                    Material: true
                },
                where: {
                    productId: req.params.productId,
                    status: "active"
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })
            res.json({ results: formulars })
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
            await prisma.productFormular.update({
                where: {
                    id: req.params.id
                },
                data: req.body
            })
            res.json({ message: 'success' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },
    remove: async (req, res) => {
        try {
            await prisma.productFormular.update({
                where: {
                    id: req.params.formularId
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