-- This file allow to write SQL commands that will be emitted in test and dev.
-- The commands are commented as their support depends of the database
-- insert into myentity (id, field) values(1, 'field-1');
-- insert into myentity (id, field) values(2, 'field-2');
-- insert into myentity (id, field) values(3, 'field-3');
-- alter sequence myentity_seq restart with 4;

INSERT INTO usuario (login,email, senha_hash, perfil)
VALUES (
    'rhuan',
    'rhuan@example.com',
    '$2a$10$A3KTUbjTaAi1Gi65/EGEfuaab0vjVsQNmxAqVZTjLrYhiuEQSwkji',
    'ADMIN'
);

