const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const Joi = require("joi")

const productType = Joi.object({
    name: Joi.string().required(),
    remark: Joi.any().optional()
})

const createSchema = productType
const updateSchema = productType

module.exports = {
    create: async (req, res) => {
        try {
            await createSchema.validateAsync(req.body, {abortEarly: false})
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }

        try {
            await prisma.productType.create({
                data: {
                    name: req.body.name,
                    remark: req.body.remark
                }
            })
            res.json({ message: 'success' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },
    list: async (req, res) => {
        try {
            const productTypes = await prisma.productType.findMany({
                where: {
                    status: 'active'
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })
            res.json({ results: productTypes })
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
            await prisma.productType.update({
                where: {
                    id: req.params.id
                },
                data: {
                    name: req.body.name,
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
            await prisma.productType.update({
                where: {
                    id: req.params.id
                },
                data: {
                    status: 'inactive'
                }
            })
            res.json({ message: 'success' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}