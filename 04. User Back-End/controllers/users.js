const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')

/* Mongoose populate method joins notes to users. 
userRouter.get('/', async(req, res) => {
    const users = await User.find({})
    res.json(users)
}) */

userRouter.get('/', async(req, res) => {
    const users = await User
        .find({}).populate('notes')

    res.json(users)
})

userRouter.post('/', async(req, res) => {
    const { username, name, password } = req.body

    const saltRound = 10
    const passwordHash = await bcrypt.hash(password, saltRound)

    const user = new User({
        username,
        name,
        passwordHash
    })

    const savedUser = await user.save()
    res.status(201).json(savedUser)
})

userRouter.delete('/:id', async(req, res, next) => {
    User.findByIdAndDelete(req.params.id)
        .then(() => {
            res.status(204).end()
        })
        .catch(err => next(err))
})

userRouter.put('/:id', async(req, res, next) => {
    const body = req.body
    const saltRound = 10
    const passwordHash = await bcrypt.hash(body.password, saltRound)
    const user = {
        username: body.username,
        name: body.name,
        password: passwordHash
    }

    User.findByIdAndUpdate(req.params.id, user, {new: true})
        .then(updatedUser => {
            res.json(updatedUser)
        })
        .catch(err => next(err))
})

module.exports = userRouter