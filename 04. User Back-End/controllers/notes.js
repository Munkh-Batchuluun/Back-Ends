const notesRouter = require('express').Router()
const Note = require('../models/node')

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

module.exports = notesRouter