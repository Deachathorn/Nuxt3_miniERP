const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const dayjs = require("dayjs")

module.exports = {
    production: async (req, res) => {
        try {
            const fromDate = dayjs(req.body.fromDate).format("YYYY-MM-DD 00:00:00")
            const toDate = dayjs(req.body.toDate).format("YYYY-MM-DD 23:59:59")

            const productions = await prisma.production.findMany({
                include: {
                    ProductionPlan: {
                        include: {
                            Product: true
                        }
                    }
                },
                where: {
                    status: "active",
                    createdAt: {
                        gte: dayjs(fromDate).toDate(),
                        lte: dayjs(toDate).toDate()
                    }
                }
            })
            res.json({ results: productions })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },
    productsAndCost: async (req, res) => {
        try {
            const products = await prisma.product.findMany({
                include: {
                    ProductFormular: {
                        include: {
                            Material: true
                        },
                        where: {
                            status: "active"
                        }
                    }
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
    sumProductionPlanPerYearAndMonth: async (req, res) => {
        try {
            const year = req.body.year
            const month = req.body.month

            const totalDayInMonth = new Date(year, month, 0).getDate()

            const productionPlan = await prisma.productionPlan.aggregate({
                _sum: {
                    quantity: true
                },
                where: {
                    createdAt: {
                        gte: dayjs(`${year}-${month}-01`).toDate(),
                        lte: dayjs(`${year}-${month}-${totalDayInMonth}`).toDate()
                    },
                    status: "active"
                }
            })
            res.json({ results: productionPlan._sum.quantity ?? 0 })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },
    sumProductionPerYearAndMonth: async (req, res) => {
        try {
            const year = req.body.year
            const month = req.body.month

            const totalDaysInMonth = new Date(year, month, 0).getDate();
            const arr = []

            const production = await prisma.production.aggregate({
                _sum: {
                    quantity: true
                },
                where: {
                    createdAt: {
                        gte: dayjs(`${year}-${month}-01`).toDate(),
                        lte: dayjs(`${year}-${month}-${totalDaysInMonth}`).toDate()
                    },
                    status: "active"
                }
            })
            arr.push(production._sum.quantity ?? 0)
            res.json({ results: arr })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },
    sumPriceStockMaterialPerYearAndMonth: async (req, res) => {
        try {
            const year = req.body.year
            const month = req.body.month

            const totalDayInMonth = new Date(year, month, 0).getDate()

            const stockMaterials = await prisma.stockMaterial.aggregate({
                _sum: {
                    price: true,
                    quantity: true
                },
                where: {
                    createdAt: {
                        gte: dayjs(`${year}-${month}-01`).toDate(),
                        lte: dayjs(`${year}-${month}-${totalDayInMonth}`).toDate()
                    }
                }
            })
            const total = stockMaterials._sum.price * stockMaterials._sum.quantity
            res.json({ results: total ?? 0 })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },
    sumProductionPerDayInmonthAndYear: async (req, res) => {
        try {
            const year = req.body.year
            const month = req.body.month

            let totalDayInMonth = new Date(year, month, 0).getDate()
            const arr = []

            for (let i = 1; i < totalDayInMonth; i++) {
                let startDate = dayjs(`${year}-${month}-${i}`).format("YYYY-MM-DD 00:00:00")
                let endDate = dayjs(`${year}-${month}-${i}`).format("YYYY-MM-DD 23:59:59")

                const production = await prisma.production.aggregate({
                    _sum: {
                        quantity: true
                    },
                    where: {
                        createdAt: {
                            gte: dayjs(startDate).toDate(),
                            lte: dayjs(endDate).toDate()
                        },
                        status: "active"
                    }
                })
                arr.push(production._sum.quantity ?? 0)
            }
            res.json({ results: arr })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },
    sumProductionPerMonthAndYear: async (req, res) => {
        try {
            const year = req.body.year
            const arr = []

            for (let i = 1; i <= 12; i++) {
                const totalDayInMonth = new Date(year, i, 0).getDate()
                const production = await prisma.production.aggregate({
                    _sum: {
                        quantity: true
                    },
                    where: {
                        createdAt: {
                            gte: dayjs(`${year}-${i}-01`).toDate(),
                            lte: dayjs(`${year}-${i}-${totalDayInMonth}`).toDate()
                        },
                        status: "active"
                    }
                })
                arr.push(production._sum.quantity ?? 0)
            }
            res.json({ results: arr })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}