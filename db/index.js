const mysql = require('mysql')

const db = mysql.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'Qwt8386637012',
    database: 'bishe'
})

module.exports = db