const logger = require('./logger')

const requestLogger = (req, next) => {
    logger.info('Method: ', req.method)
    logger.info('Path: ', req.path)
    logger.info('Body: ', req.body)
    logger.info('----------------')
    next()
}

const unknownEndpoint = (res) => {
    res.status(404).send({ error: 'Unknown end-point' })
}

const errorHandler = (err, res, next) => {
    logger.error(err)

    if(err === 'CastError'){
        return res.status(404).send({ error: 'Malformatted id'})
    } else if(err === 'ValidationError'){
        return res.status(404).json({ error: err.message})
    }

    next(err)
}

module.exports = {
    requestLogger, 
    unknownEndpoint, 
    errorHandler
}