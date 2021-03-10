const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const mariadb = require('mariadb')

let createConnection = () => mariadb.createPool({
    host: 'localhost',
    port: 3307,
    user: 'root',
    database: 'gostyle'
})

const query = (queryStr, values) => {
    return new Promise((resolve, reject) => {
        const connection = createConnection()
        connection.getConnection().then(conn => conn.query(queryStr, values, (error, results) => {
            connection.end()
            if (error) {reject(error)}
            resolve(results)
        }))

    })
}

const getPromotionsDB = () => query('select * from promotion')

const findPromotionDB = (id) => query('select * from promotion where id=?', [id]).then(res => res[0])

const replacePromotionDB = (id, newpromotion) => {
    return query('update promotion set nom=?, promotion=?, categorie_id=?, nb_utilisation=?, image=?, date_expiration=?, description=?, utilisateur_id=? where id=?',
        [newpromotion.nom, newpromotion.promotion, newpromotion.categorie_id, newpromotion.nb_utilisation, newpromotion.image, newpromotion.date_expiration, newpromotion.description, newpromotion.utilisateur_id, id])
        .then(() => findpromotion(newpromotion.id))
}

const insertPromotionsDB = (promotion) => {
    const newpromotion = Object.assign({}, promotion, { id: uuidv4() })
    return query('insert into promotion (id, nom, promotion, categorie_id, nb_utilisation, image, date_expiration, description, utilisateur_id) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newpromotion.nom, newpromotion.promotion, newpromotion.categorie_id, newpromotion.nb_utilisation, newpromotion.image, newpromotion.date_expiration, newpromotion.description, newpromotion.utilisateur_id])
        .then(() => findpromotion(newpromotion.id))
}

const deletePromotionDB = (id) => query('delete from promotion where id=?', [id])

module.exports = {
    getPromotionsDB,
    findPromotionDB,
    replacePromotionDB,
    insertPromotionsDB,
    deletePromotionDB
}
