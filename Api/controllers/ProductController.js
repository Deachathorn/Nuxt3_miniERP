const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient
const Joi = require("joi")

const productSchema = Joi.object({
    name: Joi.string().required(),
    remark: Joi.any().optional()
}).unknown(true)

const createSchema = productSchema
const updateSchema = productSchema

module.exports = {
    create: async (req, res) => {
        try {
            await createSchema.validateAsync(req.body, {abortEarly: false})
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }

        try {
            await prisma.product.create({
                data: req.body
            })
            res.json({ message: 'success' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },
    list: async (req, res) => {
        try {
            const products = await prisma.product.findMany({
                include: {
                    Packaging: true,
                    ProductType: true
                },
                where: {
                    status: "active"
                },
                orderBy: {
                    createdAt: "desc"
                }
            })
            res.json({ results: products })
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
            await prisma.product.update({
                data: req.body,
                where: {
                    id: req.params.id
                }
            })
            res.json({ message: 'success' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },
    remove: async (req, res) => {
        try {
            await prisma.product.update({
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