const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()
const multer = require('multer')
const sharp = require('sharp')
const mail=require('../mail/mail')

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        mail.Created(user.email,user.name)
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        mail.Deleted(req.user.email,req.user.name)
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})
const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
     if(!file.originalname.match(/\.(jpg|jpeg|png)$/gi))
     return cb(new Error('Please Upload an Image'))
     cb(undefined,true)

    }
})
router.post('/users/me/upload',auth,upload.single('avatar'),async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send({Success:'Successfully Uploaded the file'})
},(error,req,res,next)=>{
    res.status(400).send({
        error:error.message
    })
})
router.delete('/users/me/upload',auth,async (req,res)=>{
    try{
    req.user.avatar= undefined
    await req.user.save()
    res.send('Avatar deleted Successfully')
    }
    catch{
        res.status(500).send()
    }
})
router.get('/users/:id/avatar',async(req,res)=>{
    try{
        const user =await User.findById(req.params.id)
        if(!user || !user.avatar)
        throw new Error()

        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }
    catch{
        res.status(404).send()
    }
})
module.exports = router