CREATE DATABASE IF NOT EXISTS task_management;
USE task_management;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (createdAt)
);

INSERT IGNORE INTO users (name, email, passwordHash) VALUES 
('John Doe', 'john@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj95.1LF/7HO'),
('Jane Smith', 'jane@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj95.1LF/7HO'),
('Bob Johnson', 'bob@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj95.1LF/7HO');

CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.createdAt,
    COUNT(CASE WHEN t.status = 'todo' AND t.isDeleted = false THEN 1 END) as todo_count,
    COUNT(CASE WHEN t.status = 'in-progress' AND t.isDeleted = false THEN 1 END) as in_progress_count,
    COUNT(CASE WHEN t.status = 'done' AND t.isDeleted = false THEN 1 END) as done_count,
    COUNT(CASE WHEN t.isDeleted = false THEN 1 END) as total_tasks
FROM users u
LEFT JOIN tasks t ON u.id = t.userId
GROUP BY u.id, u.name, u.email, u.createdAt;
