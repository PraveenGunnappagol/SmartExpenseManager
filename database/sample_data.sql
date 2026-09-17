USE smart_expense_manager;

INSERT INTO categories (name)
VALUES
    ('Food'),
    ('Transport'),
    ('Shopping'),
    ('Bills'),
    ('Entertainment'),
    ('Health'),
    ('Education'),
    ('Other')
ON DUPLICATE KEY UPDATE
    name = VALUES(name);