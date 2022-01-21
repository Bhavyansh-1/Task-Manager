const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks',auth, async (req, res) => {
    const task = new Task({description:req.body.description,completed:req.body.completed,owner:req.user._id})

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/tasks',auth, async (req, res) => {
    var sortBy=-1000
    if(req.query.sortBy)
    {
    sortBy = req.query.sortBy.split(':')
    if(sortBy[1]==='asc')
    sortBy[1]=parseInt('1')
    else
    sortBy[1]=parseInt('-1')
    }
    if(req.query.completed)
    {
        var completed
        if(req.query.completed==='true')
        completed=true
        else
        completed=false
        try {
            var tasks
            if(sortBy!==-1000)
            tasks = await Task.find({owner:req.user._id,completed}).limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip)).sort([[sortBy[0], sortBy[1]]])
            else
            tasks = await Task.find({owner:req.user._id,completed}).limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip))
            res.send(tasks)
        } catch (e) {
            res.status(500).send()
        }
    }
    else{
        try {
            var tasks
            if(sortBy!==-1000)
            tasks = await Task.find({owner:req.user._id}).limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip)).sort([[sortBy[0], sortBy[1]]])
            else
            tasks = await Task.find({owner:req.user._id}).limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip))
            res.send(tasks)
        } catch (e) {
            res.status(500).send()
        }
    }
    
})

router.get('/tasks/:id', auth,async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({_id,owner:req.user._id})
        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})
        if (!task) {
            return res.status(404).send()
        }
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id',auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})

        if (!task) {
            res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router