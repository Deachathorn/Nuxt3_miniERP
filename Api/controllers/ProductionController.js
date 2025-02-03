const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const Joi = require('joi')

const productionSchema = Joi.object({
    quantity: Joi.number().integer().greater(0).required(),
    remark: Joi.any().optional()
}).unknown(true)

const createSchema = productionSchema

module.exports = {
    list: async (req, res) => {
        try {
            const production = await prisma.production.findMany({
                where: {
                    status: "active",
                    productionPlanId: req.params.productionPlanId
                },
                include: {
                    ProductionPlan: {
                        include: {
                            Product: {
                                include: {
                                    Packaging: true,
                                    ProductType: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            })
            res.json({ results: production })
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
            await prisma.production.create({
                data: req.body
            })
            res.json({ message: 'success' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },
    update: async (req, res) => {
        try {
            await prisma.production.update({
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
            await prisma.production.update({
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