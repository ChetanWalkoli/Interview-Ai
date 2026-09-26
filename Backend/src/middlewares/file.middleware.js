const multer = reqire("multer")

const upload = multer({
    storage : multer.memmoryStorage(),
    Limits: {
        filesize : 3*1024*1024 // 3MB
    }
})

module.exports = upload