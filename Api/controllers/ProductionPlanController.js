const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const Joi = require('joi')

const productionPlanSchema = Joi.object({
    quantity: Joi.number().integer().greater(0).required(),
    remark: Joi.any().optional()
}).unknown(true)

const createSchema = productionPlanSchema
const updateSchema = productionPlanSchema

module.exports = {
    list: async (req, res) => {
        try {
            const plans = await prisma.productionPlan.findMany({
                where: {
                    status: 'active'
                },
                include: {
                    Product: {
                        include: {
                            ProductType: true,
                            Packaging: true
                        }
                    },
                    Production: {
                        where: {
                            status: "active"
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })
            res.json({ results: plans })
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
            await prisma.productionPlan.create({
                data: req.body
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
            await prisma.productionPlan.update({
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
            await prisma.productionPlan.update({
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