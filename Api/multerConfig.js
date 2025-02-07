const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + path.extname(file.originalname)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const filterFile = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if(!allowedTypes.includes(file.mimetype)) {
        return cb(new Error("Only JPEG, PNG, JPG files are allowed"), false)
    }
    return cb(null, true)
}

const upload = multer({
    storage: storage,
    limits: {fileSize: 1024 * 1024 * 2},
    fileFilter: filterFile
})

module.exports = { upload }