-- Initial Admin User
-- Username: admin
-- Password: admin123 (BCrypt encrypted)
INSERT INTO users (username, password, role) 
SELECT 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gBkoDm', 'ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');
