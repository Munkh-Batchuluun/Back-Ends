const notesRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Note = require('../models/note')
const User = require('../models/user')

notesRouter.get('/', (req, res) => {
    Note.find({}).then(note => {
        res.json(note)
    })
})

notesRouter.get('/:id', (req, res, next) => {
    Note.findById(req.params.id)
        .then(note => {
            if(note){
                res.json(note)
            } else {
                res.status(404).end()
            }
        })
        .catch(err => next(err))
})

const getTokenFrom = req => {
    const authorization = req.get('authorization')
    console.log(authorization)
    if(authorization && authorization.startsWith('Bearer ')){
        return authorization.replace('Bearer ', '')
    }
    return null
}

notesRouter.post('/', async(req, res, next) => {
    const body = req.body

    let decodedToken;
    try {
        const token = getTokenFrom(req);
        decodedToken = jwt.verify(token, process.env.SECRET);
    } catch (error) {
        return next(error);
    }
    
    if(!decodedToken.id){
        return res.status(401).json({ error: 'Token invalid' })
    }

    const user = await User.findById(decodedToken.id)

    const note = new Note({
        content: body.content,
        important: body.important || false,
        user: user._id
    })

    const savedNote = await note.save()
    user.notes = user.notes.concat(savedNote._id)
    await user.save()

    res.json(savedNote)
})

notesRouter.delete('/:id', async(req, res, next) => {
    Note.findByIdAndDelete(req.params.id)
        .then(() => {
            res.status(204).end()
        })
        .catch(err => next(err))
})

notesRouter.put('/:id', async(req, res, next) => {
    const body = req.body
    const note = {
        content: body.content,
        important: body.important,
    }

    Note.findByIdAndUpdate(req.params.id, note, { new: true })
        .then((updatedNote) => {
            res.json(updatedNote)
        })
        .catch(err => next(err))
})


module.exports = notesRouter