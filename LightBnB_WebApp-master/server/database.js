const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { client } = require('./db/connection');

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  const values = [ email ];
  return client
    .query('SELECT * FROM users WHERE email = $1', values)
    .then(res => res ? res.rows[0] : null )
    .catch(err => console.error(err.message))
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  const values = [ id ];
  return client
    .query('SELECT * FROM users WHERE id = $1', values)
    .then(res => res ? res.rows[0] : null)
    .catch(err => console.error('User not found'))
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  const values = Object.values(user);
  return client
    .query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *;', values)
    .then(res => res.rows[0] )
    .catch(err => console.error(err.message) )
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  const values = [ guest_id ];
  let sqlQuery = 'SELECT properties.id AS id, title AS title, cost_per_night, reservations.start_date, AVG(property_reviews.rating) AS average_rating ';
  sqlQuery += 'FROM reservations, properties ';
  sqlQuery += 'JOIN property_reviews ON property_reviews.property_id = properties.id ';
  sqlQuery += 'WHERE reservations.guest_id = $1 ';
  sqlQuery += 'AND start_date < Now()::date ';
  sqlQuery += 'GROUP BY properties.id, reservations.start_date ';
  sqlQuery += 'ORDER BY start_date DESC LIMIT 10;';

  return client
    .query(sqlQuery, values)
    .then(res => res.rows )
    .catch(err => console.error(err.message) )
}  
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {
  // Setup an array to hold any parameters that may be available for the query.
  const queryParams = [];
  // Start the query with all information that comes before the WHERE clause.
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  LEFT JOIN property_reviews ON properties.id = property_id
  `;

  // Check if a city has been passed in as an option. Add the city to the params array and create a WHERE clause for the city.
  // We can use the length of the array to dynamically get the $n placeholder number. Since this is the first parameter, it will be $1.
  // The % syntax for the LIKE clause must be part of the parameter, not the query.
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  // if an owner_id is passed in, only return properties belonging to that owner.
  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    queryString += `AND owner_id = $${queryParams.length} `;
  }

  // if a minimum_price_per_night, only return properties within that price range.
  if (options.minimum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night * 100}`);
    queryString += `AND cost_per_night >= $${queryParams.length} `;
  }
  
  // if a maximum_price_per_night, only return properties within that price range.
  if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night * 100}`);
    queryString += `AND cost_per_night <= $${queryParams.length} `;
  }

  // if a minimum_rating is passed in, only return properties with a rating equal to or higher than that.
  if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night * 100}`);
    queryString += `AND cost_per_night <= $${queryParams.length} `;
  }

  // if a minimum_rating is passed in, only return properties with a rating equal to or higher than that.
  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += `AND property_reviews.rating >= $${queryParams.length} `;
  }

  // Add any query that comes after the WHERE clause.
  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // Run the query
  return client
    .query(queryString, queryParams)
    .then(res => res.rows)
    .catch(err => console.error(err.message))
    
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {

  // Normalize the cost per night
  property.cost_per_night *= 100;
  const values = Object.values(property);

  let sqlQuery = 'INSERT INTO properties (title, description, number_of_bathrooms, number_of_bedrooms, parking_spaces, cost_per_night, '
  sqlQuery += 'thumbnail_photo_url, cover_photo_url, street, country, city, province, post_code, owner_id) ';
  sqlQuery += 'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *;';

  return client
    .query(sqlQuery, values)
    .then(res => res.rows)
    .catch(err => console.error(err.message))
}
exports.addProperty = addProperty;
