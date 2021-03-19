const fs = require('fs')
const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000
const { v4: uuidv4 } = require('uuid')

app.use(express.json())
app.use(cors())

//Swagger
const swaggerUi = require('swagger-ui-express'),
swaggerDocument = require('./swagger.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
const { getPromotionsDB, findPromotionsDB, replacePromotionsDB, insertPromotionsDB, deletePromotionsDB,
    getUsersDB, findUsersDB, replaceUsersDB, insertUsersDB, deleteUsersDB } = require('./maria_db')

app.listen(port, () => {
    console.log('Example app listening at http://localhost:3000/')
})

app.get('/promotions', (req, res) => {
    printLog(req)
    getPromotionsDB().then(v => res.send(v))
})
app.get('/users', (req, res) => {
    printLog(req)
    getUsersDB().then(v => res.send(v))
})

app.get('/promotions/:id', (req, res) =>{
    printLog(req)
    const id = req.params.id
    findPromotionsDB(id)
        .then(promotion => {
            if (promotion) {
                res.send(promotion)
            } else {
                res.status(404).end()
            }
        })
})
app.get('/users/:id', (req, res) =>{
    printLog(req)
    const id = req.params.id
    findUsersDB(id)
        .then(user => {
            if (user) {
                res.send(user)
            } else {
                res.status(404).end()
            }
        })
})

const putOrPatchPromotion = (req, res) => {
    const { id, ...body } = req.body
    const promotionId = req.params.id
    findPromotionsDB(promotionId)
        .then(promotion => {
            if (promotion) {
                const newPromotion = Object.assign({}, promotion, body)
                replacePromotionsDB(promotionId, newPromotion).then(() => res.send(newPromotion))
            } else {
                res.status(404).end()
            }
        })
}
const putOrPatchUser = (req, res) => {
    const { id, ...body } = req.body
    const userId = req.params.id
    findUsersDB(userId)
        .then(user => {
            if (user) {
                const newUser = Object.assign({}, user, body)
                replaceUsersDB(userId, newUser).then(() => res.send(newUser))
            } else {
                res.status(404).end()
            }
        })
}

app.put('/promotions/:id', putOrPatchPromotion)

app.put('/users/:id', putOrPatchUser)

app.post('/promotions', (req, res) => {
    printLog(req)
    insertPromotionsDB(req.body)
        .then(promotion => res.status(201).send(promotion))
})
app.post('/users', (req, res) => {
    printLog(req)
    insertUsersDB(req.body)
        .then(user => res.status(201).send(user))
})

app.delete('/promotions/:id', (req, res) => {
    printLog(req)
    deletePromotionsDB(req.params.id)
        .then(() => res.status(204).end())
})
app.delete('/users/:id', (req, res) => {
    printLog(req)
    deleteUsersDB(req.params.id)
        .then(() => res.status(204).end())
})

app.patch('/promotions/:id', putOrPatchPromotion)

app.patch('/users/:id', putOrPatchUser)

function printLog(req) {
    console.log("new Requete")
    console.log("  " + req.method + req.originalUrl) //La requete (methode + route)
    console.log("  " + req.headers['x-forwarded-for'] || req.socket.remoteAddress) //l'adresse ip de l'émeteur
    console.log("End Requete ")
}


