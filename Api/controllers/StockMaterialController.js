const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const Joi = require("joi")

const MaterialSchema = Joi.object({
    quantity: Joi.number().integer().greater(0).required(),
    price: Joi.number().integer().greater(0).required(),
    remark: Joi.any().optional()
}).unknown(true)

module.exports = {
    create: async (req, res) => {
        try {
            await MaterialSchema.validateAsync(req.body, {abortEarly: false})
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }

        try {
            await prisma.stockMaterial.create({
                data: {
                    materialId: req.body.material_id,
                    quantity: req.body.quantity,
                    price: req.body.price,
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
            const stockMaterials = await prisma.stockMaterial.findMany({
                include: {
                    Material: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })
            res.json({ results: stockMaterials })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },
    // update: async (req, res) => {
    //     try {
    //         res.json({ message: 'success' })
    //     } catch (error) {
    //         res.status(500).json({ error: error.message })
    //     }
    // },
    remove: async (req, res) => {
        try {
            await prisma.stockMaterial.delete({
                where: {
                    id: req.params.id
                }
            })
            res.json({ message: 'success' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}