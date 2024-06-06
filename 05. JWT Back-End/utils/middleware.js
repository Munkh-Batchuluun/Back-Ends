const requestLogger = (req, res, next) => {
    console.log('Method: ', req.method)
    console.log('Path: ', req.path)
    console.log('Body: ', req.body)
    console.log('----------------')
    next()
}

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'Unknown end-point'})
}

const errorHandler = (err, req, res, next) => {
    console.log(err)

    if(err.name === 'CastError'){
        return res.status(404).send({ error: 'Malformatted id'})
    } else if(err.name === 'ValidationError'){ 
        return res.status(404).json({ error: err.message })
    } else if(err.name === 'MongoServerError' && err.message.includes('E11000 duplicate key error')){
        return res.status(400).json({ error: 'Expected `username` to be unique' })
    }

    next(err)
}

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler
}