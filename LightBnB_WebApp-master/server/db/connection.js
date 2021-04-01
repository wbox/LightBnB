const e = require('express');
const pg = require('pg');

const Client = pg.Client;

const configDb ={
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT
};

const client = new Client(configDb);
client.connect()
  .catch(e => console.error(e));

module.exports = { client };