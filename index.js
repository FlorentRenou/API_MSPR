const fs = require('fs')
const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000
const { v4: uuidv4 } = require('uuid')

app.use(express.json())
app.use(cors())

const getPromotions = () => {
    purgeCache('./Promotions.json')
    return require('./Promotions.json')
}

const getUsers = () => {
    purgeCache('./Users.json')
    return require('./Users.json')
}

const findPromotion = (id) => getPromotions().find(b => b.id === id)

const findUser = (id) => getUsers().find(b => b.id === id)

app.listen(port, () => {
    console.log('Example app listening at http://localhost:3000/')
})

app.get('/promotions', (req, res) => {
    printLog(req)
    res.status(200).json(getPromotions())
})

app.get('/users', (req, res) => {
    printLog(req)
    res.status(200).json(getUsers())
})

app.get('/promotions/:id', (req, res) =>{
    printLog(req)
    const id = req.params.id
    const promotion = getPromotions().find(promotion => promotion.id === id)
    if(promotion){
        res.status(200).json(promotion)
    }
    else {
        res.status(404).end()
    }

})
app.get('/users/:id', (req, res) =>{
    printLog(req)
    const id = req.params.id
    const user = getUsers().find(user => user.id === id)
    if(user){
        res.status(200).json(user)
    }
    else {
        res.status(404).end()
    }

})

app.put('/promotions/:id', (req, res) => {
    const body = req.body
    const promotionID = req.params.id
    body.id = promotionID
    const promotions = getPromotions()
    const promotion = findPromotion(promotionID)
    if (promotion) {
        const promotionIdx = promotions.findIndex(b => b.id === promotionID)
        promotions.splice(promotionIdx, 1, body)
        fs.writeFileSync(__dirname + '\\.\\Promotions.json', JSON.stringify(promotions))
        res.send(body)
    } else {
        res.status(404).end()
    }
})
app.put('/users/:id', (req, res) => {
    const body = req.body
    const userID = req.params.id
    body.id = userID
    const users = getUsers()
    const user = findUser(promotionID)
    if (user) {
        const promotionIdx = users.findIndex(b => b.id === userID)
        users.splice(promotionIdx, 1, body)
        fs.writeFileSync(__dirname + '\\.\\Users.json', JSON.stringify(users))
        res.send(body)
    } else {
        res.status(404).end()
    }
})

app.post('/promotions', (req, res) => {
    printLog(req)
    let promotions = getPromotions()
    let newPromotion = req.body
    newPromotion.id = uuidv4()
    promotions.push(newPromotion)
    fs.writeFileSync(__dirname + '\\.\\Promotions.json', JSON.stringify(promotions))
    res.status(201).send(newPromotion)
})
app.post('/users', (req, res) => {
    printLog(req)
    let users = getUsers()
    let newUser = req.body
    newUser.id = uuidv4()
    users.push(newUser)
    fs.writeFileSync(__dirname + '\\.\\Users.json', JSON.stringify(users))
    res.status(201).send(newUser)
})

app.delete('/promotions/:id', (req, res) => {
    printLog(req)
    let promotions = getPromotions()
    let promotionID = req.params.id
    if(promotions.find(b => b.id === promotionID)){
        const nPromotions = promotions.filter(b => b.id !== promotionID)
        fs.writeFileSync(__dirname + '\\.\\Promotions.json', JSON.stringify(nPromotions))
        res.status(204).end()
    } else {
        res.status(404).end()
    }
})
app.delete('/users/:id', (req, res) => {
    printLog(req)
    let users = getUsers()
    let userID = req.params.id
    if(users.find(b => b.id === userID)){
        const nUsers = users.filter(b => b.id !== userID)
        fs.writeFileSync(__dirname + '\\.\\Users.json', JSON.stringify(nUsers))
        res.status(204).end()
    } else {
        res.status(404).end()
    }
})

app.patch('/promotions/:id', (req, res) => {
    printLog(req)
    const body = req.body
    const promotionID = req.params.id
    const promotions = getPromotions()
    const promotion = findPromotion(promotionID)
    if (promotion) {
        const newPromotion = Object.assign({}, promotion, body)
        const promotionIdx = promotions.findIndex(b => b.id === promotionID)
        promotions.splice(promotionIdx, 1, newPromotion)
        fs.writeFileSync(__dirname + '\\.\\Promotions.json', JSON.stringify(promotions))
        res.send(newPromotion)
    } else {
        res.status(404).end()
    }
})
app.patch('/users/:id', (req, res) => {
    printLog(req)
    const body = req.body
    const userID = req.params.id
    const users = getPromotions()
    const user = findPromotion(userID)
    if (user) {
        const newUser = Object.assign({}, user, body)
        const userIdx = user.findIndex(b => b.id === userID)
        users.splice(userIdx, 1, newUser)
        fs.writeFileSync(__dirname + '\\.\\User.json', JSON.stringify(users))
        res.send(newUser)
    } else {
        res.status(404).end()
    }
})

function printLog(req) {
    console.log("new Requete")
    console.log("  " + req.method + req.originalUrl) //La requete (methode + route)
    console.log("  " + req.headers['x-forwarded-for'] || req.socket.remoteAddress) //l'adresse ip de l'émeteur
    console.log("End Requete ")
}

/**
 * Removes a module from the cache
 */
function purgeCache(moduleName) {
    // Traverse the cache looking for the files
    // loaded by the specified module name
    searchCache(moduleName, function (mod) {
        delete require.cache[mod.id];
    });

    // Remove cached paths to the module.
    // Thanks to @bentael for pointing this out.
    Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
        if (cacheKey.indexOf(moduleName)>0) {
            delete module.constructor._pathCache[cacheKey];
        }
    });
};

/**
 * Traverses the cache to search for all the cached
 * files of the specified module name
 */
function searchCache(moduleName, callback) {
    // Resolve the module identified by the specified name
    var mod = require.resolve(moduleName);

    // Check if the module has been resolved and found within
    // the cache
    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        // Recursively go over the results
        (function traverse(mod) {
            // Go over each of the module's children and
            // traverse them
            mod.children.forEach(function (child) {
                traverse(child);
            });

            // Call the specified callback providing the
            // found cached module
            callback(mod);
        }(mod));
    }
};
