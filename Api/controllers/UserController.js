const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const bcrypt = require("bcrypt")
const Joi = require("joi")
const path = require("path")
const fs = require("fs")

dotenv.config()

const signInSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})

const userSchema = Joi.object({
    name: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    level: Joi.string().required(),
    password: Joi.string().required()
})

const updateSchema = Joi.object({
    name: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    profile_img: Joi.any().optional(),
    level: Joi.string().required(),
    password: Joi.any().optional()
})

const createSchema = userSchema
const updateUsers = userSchema

const emailValidator = async (value, userId) => {
    const condiTion = userId ? { email: value, id: {not: userId} } : { email: value }
    const user = await prisma.user.findFirst({
        where: condiTion
    })

    if (user) {
        throw new Error('This email is already taken')
    }
    return true
}

module.exports = {
    signIn: async (req, res) => {
        try {
            await signInSchema.validateAsync(req.body, {abortEarly: false})
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }

        try {
            const email = req.body.email
            const password = req.body.password

            if(!email || !password){
                return res.status(400).json({message: "Username and Password are required"})
            }

            
            const user = await prisma.user.findFirst({
                where: {
                    email: email,
                    status: "active"
                }
            })

            if(!(await bcrypt.compare(password, user.password))){
                return res.status(401).json({ message: "Invalid username or password" })
            }

            if(!user){
                return res.status(401).json({ message: "Invalid username or password" })
            }

            const payload = {
                id: user.id,
                email: user.email,
                username: user.username
            }

            const key = process.env.SECRET_KEY
            const token = jwt.sign(payload, key, { expiresIn: "30d" })

            res.json({ token: token, level: user.level, id: user.id })
        } catch (error) {
            res.status(500).json({ message: error.message })
            console.log(error)
        }
    },
    info: async (req, res) => {
        try {
            const token = req.headers.authorization.split(" ")[1]
            const payload = jwt.verify(token, process.env.SECRET_KEY)
            const user = await prisma.user.findUnique({
                select: {
                    name: true,
                    username: true,
                    email: true,
                    profilePic: true,
                    level: true
                },
                where: {
                    id: payload.id
                }
            })
            res.json({ result: user })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },
    update: async (req, res) => {
        try {
            await updateSchema.validateAsync(req.body, {abortEarly: false})
        } catch (error) {
            res.status(400).json({ error: error.message })
        }

        try {
            const token = req.headers.authorization.split(" ")[1]
            const payload = jwt.verify(token, process.env.SECRET_KEY)

            await emailValidator(req.body.email, payload.id)

            let password = req.body.password ? await bcrypt.hash(req.body.password, 10) : null
            let oldPassword = password

            const oldUser = await prisma.user.findUnique({
                where: {id: payload.id}
            })

            if (!password) oldPassword = oldUser.password

            let filePath = oldUser.profilePic

            if (req.file) {
                if (oldUser.profilePic) {
                    const oldFilePath = path.join(process.cwd(), '/uploads/' + oldUser.profilePic)
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath)
                        console.log("remove: ", oldUser.profilePic)
                    }
                }
                filePath = req.file.filename
            }

            await prisma.user.update({
                where: {
                    id: payload.id
                },
                data: {
                    name: req.body.name,
                    username: req.body.username,
                    email: req.body.email,
                    profilePic: filePath,
                    level: req.body.level,
                    password: oldPassword
                }
            })

            res.json({ message: 'success' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },
    create: async (req, res) => {
        try {
            await createSchema.validateAsync(req.body, {abortEarly: false})
        } catch (error) {
            res.status(400).json({ error: error.message })
        }

        try {
            await emailValidator(req.body.email, null)

            const password = await bcrypt.hash(req.body.password, 10)
            await prisma.user.create({
                data: {
                    name: req.body.name,
                    username: req.body.username,
                    email: req.body.email,
                    password: password,
                    level: req.body.level
                }
            })
            res.json({ message: 'success' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },
    list: async (req, res) => {
        try {
            const users = await prisma.user.findMany({
                where: {
                    status: "active"
                },
                orderBy: {
                    createdAt: "desc"
                }
            })
            res.json({ results: users })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },
    remove: async (req, res) => {
        try {
            await prisma.user.update({
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
    },
    updateUser: async (req, res) => {
        try {
            await updateUsers.validateAsync(req.body, {abortEarly: false})
        } catch (error) {
            res.status(400).json({ error: error.message })
        }

        try {
            await emailValidator(req.body.email, req.params.id)

            const password = await bcrypt.hash(req.body.password, 10)
            let oldPassword = ''

            if (password) {
                oldPassword = password
            }
            else {
                const oldUser = await prisma.user.findUnique({
                    where: {
                        id: req.params.id
                    }
                })

                oldPassword = oldUser.password
            }

            await prisma.user.update({
                where: {
                    id: req.params.id
                },
                data: {
                    name: req.body.name,
                    username: req.body.username,
                    email: req.body.email,
                    level: req.body.level,
                    password: oldPassword
                }
            })
            res.json({ message: 'success' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}