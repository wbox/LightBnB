SELECT properties.id AS id, title AS title, cost_per_night, reservations.start_date, AVG(property_reviews.rating) AS average_rating
FROM reservations, properties
JOIN property_reviews ON property_reviews.property_id = properties.id
WHERE reservations.guest_id = 1 AND start_date < Now()::date
GROUP BY properties.id, reservations.start_date
ORDER BY start_date DESC
LIMIT 10;


-- SELECT properties.*, reservations.*, avg(rating) as average_rating
-- FROM reservations
-- JOIN properties ON reservations.property_id = properties.id
-- JOIN property_reviews ON properties.id = property_reviews.property_id 
-- WHERE reservations.guest_id = 1
-- AND reservations.end_date < now()::date
-- GROUP BY properties.id, reservations.id
-- ORDER BY reservations.start_date
-- LIMIT 10;

-- SELECT properties.*, reservations.*, AVG(property_reviews.rating) AS average_rating
-- FROM reservations
-- JOIN properties ON reservations.property_id = properties.id
-- JOIN property_reviews ON property_reviews.property_id = properties.id
-- WHERE reservations.guest_id = 1 
-- AND end_date < Now()::date
-- GROUP BY properties.id, reservations.id
-- ORDER BY start_date
-- LIMIT 10;