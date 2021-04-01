const client = require('./connection');

const getAllProperties = (limit, cb) => {
  client
    .query('SELECT * FROM properties LIMIT ' + limit + ';')
    .then(res => console.log(res.rows))
    .catch(err => console.error(err.stack))    
};

module.exports = { getAllProperties };