require('dotenv').config()
const express = require('express')
const app = express()
const Note = require('./models/notes')

// Middleware logs every request and its contents
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }

app.use(express.static('dist'))
app.use(express.json())
app.use(requestLogger)

// Routes 
app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>')
})

app.get('/api/notes', (req, res) => {
    Note.find({}).then(notes => {
        res.json(notes)
    })
})

app.get('/api/notes/:id', (req, res, next) => {
    const id = req.params.id
    Note.findById(id)
        .then(note => {
            if(note){
                res.json(note)
            } else {
                res.status(400).end()
            }
        })
        .catch(err => next(err))
})

app.post('/api/notes', (req, res, next) => {
    const body = req.body
    if(body.content === undefined){
        return res.status(400).json({ error: 'content is missing' })
    }

    const note = new Note({
        content: body.content,
        important: body.important || false
    })

    note.save()
        .then(savedNote => {
            res.json(savedNote)
        })
        .catch(err => next(err))
})

app.delete('/api/notes/:id', (req, res, next) => {
    const id = req.params.id
    Note.findByIdAndDelete(id)
        .then(result => {
            res.status(204).end()
        })
        .catch(err => next(err))
})

app.put('/api/notes/:id', (req, res, next) => {
    const id = req.params.id
    const body = req.body

    const note = {
        content: body.content,
        important: body.important
    }

    Note.findByIdAndUpdate(id, note, 
        { new: true, runValidators: true, context: 'query' })
        .then(updatedNote => {
            res.json(updatedNote)
        })
        .catch(err => next(err))
})

// Error handling (*** Error handler should be the last middleware ***)
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
  
app.use(unknownEndpoint)

const errorHandler = ( err, req, res, next ) => {
    console.log(err.message)
    if(err.name === 'CastError') {
        return res.status(404).send({ error: 'malformatted id'})
    } else if (err === 'ValidationError'){
        return res.status(404).json({ error: error.message })
    }
    next(err)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`)
})