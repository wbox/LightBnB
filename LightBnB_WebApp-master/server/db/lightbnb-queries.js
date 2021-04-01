const client = require('./connection');

const getAllProperties = (limit = 10, cb) => {
  const values = [ limit ];
  client
    .query('SELECT * FROM properties LIMIT $1', values)
    .then(res => console.log(res.rows))
    .catch(err => console.error(err.stack))    
};

module.exports = { getAllProperties };