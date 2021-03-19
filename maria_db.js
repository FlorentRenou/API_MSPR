const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const mariadb = require('mysql')

let createConnection = () => mariadb.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password:'root',
    database: 'gostyle'
})

const query = (queryStr, values) => {
    return new Promise((resolve, reject) => {
        const connection = createConnection()
        connection.connect()
        connection.query(queryStr, values, (error, results) => {
            connection.end()
            if (error) {reject(error)}
            resolve(results)
        })
    })
}

const getPromotionsDB = () => query('select * from promotion')
const getUsersDB = () => query('select * from utilisateur')

const findPromotionsDB = (id) => query('select * from promotion where id=?', [id]).then(res => res[0])
const findUsersDB = (id) => query('select * from utilisateur where id=?', [id]).then(res => res[0])

const replacePromotionsDB = (id, newpromotion) => {
    return query('update promotion set nom=?, promotion=?, categorie_id=?, nb_utilisation=?, image=?, date_expiration=?, description=?, utilisateur_id=? where id=?',
        [newpromotion.nom, newpromotion.promotion, newpromotion.categorie_id, newpromotion.nb_utilisation, newpromotion.image, newpromotion.date_expiration, newpromotion.description, newpromotion.utilisateur_id, id])
        .then(() => findPromotionsDB(newpromotion.id))
}
const replaceUsersDB = (id, newuser) => {
    return query('update utilisateur set nom=?, prenom=?, email=?, motDePasse=?, admin=? where id=?',
        [newuser.nom, newuser.prenom, newuser.email, newuser.motDePasse, newuser.admin, id])
        .then(() => findUsersDB(newuser.id))
}

const insertPromotionsDB = (promotion) => {
    const newpromotion = Object.assign({}, promotion, { id: uuidv4() })
    return query('insert into promotion (id, nom, promotion, categorie_id, nb_utilisation, image, date_expiration, description, utilisateur_id) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newpromotion.id, newpromotion.nom, newpromotion.promotion, newpromotion.categorie_id, newpromotion.nb_utilisation, newpromotion.image, newpromotion.date_expiration, newpromotion.description, newpromotion.utilisateur_id])
        .then(() => findPromotionsDB(newpromotion.id))
    console.log(query);
}
const insertUsersDB = (promotion) => {
    const newuser = Object.assign({}, promotion, { id: uuidv4() })
    return query('insert into utilisateur (id, nom, prenom, email, motDePasse, admin) values (?, ?, ?, ?, ?, ?)',
        [newuser.id, newuser.nom, newuser.prenom, newuser.email, newuser.motDePasse, newuser.admin])
        .then(() => findUsersDB(newuser.id))
}

const deletePromotionsDB = (id) => query('delete from promotion where id=?', [id])
const deleteUsersDB = (id) => query('delete from utilisateur where id=?', [id])

module.exports = {
    getPromotionsDB,
    findPromotionsDB,
    replacePromotionsDB,
    insertPromotionsDB,
    deletePromotionsDB,
    getUsersDB,
    findUsersDB,
    replaceUsersDB,
    insertUsersDB,
    deleteUsersDB
}
