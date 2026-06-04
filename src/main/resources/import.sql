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

-- Calibre de exemplo
INSERT INTO calibre (nome, marca)
VALUES ('7.62x51mm', 'Winchester');

-- Carregador de exemplo
INSERT INTO carregador (modelo, qtdmunicao, marca)
VALUES ('MK3', 30, 'Magpul');

-- Endereço e telefone do fornecedor
INSERT INTO endereco (rua, bairro, cidade, estado, cep, isprincipal)
VALUES ('Rua das Armas', 'Centro', 'Palmas', 'TO', '77000-000', false);

INSERT INTO telefone (numero)
VALUES ('(63) 99999-9999');

-- Fornecedor de exemplo
INSERT INTO fornecedor (nome, cnpj, email, endereco_id, telefone_id, ativo)
VALUES ('Armas Brasil', '12.345.678/0001-90', 'contato@armasbrasil.com', 1, 1, true);

-- Miras de exemplo
INSERT INTO mira (modelo, marca, aumentomaximo)
VALUES ('Mira X', 'Leupold', 4);

INSERT INTO miraholografica (id, alcancelaser, visaonoturna)
VALUES (1, 500, true);

INSERT INTO mira (modelo, marca, aumentomaximo)
VALUES ('RedDot Pro', 'AimTech', 2);

INSERT INTO reddot (id, niveisbrilho, duracaobateria)
VALUES (2, 5, 12.0);

INSERT INTO registro (dataregistro, numeroserie)
VALUES ('2023-01-01', 'SN001');

-- Fuzil de exemplo associado ao calibre, carregador, fornecedor e miras
INSERT INTO fuzil (nome, marca, modelo, preco, ativa, mododisparo, alcanceefetivo, possuitrilhotatico, fornecedor_id, carregador_id, registro_id, quantidadedisponivel)
VALUES ('Fuzil X', 'Colt', 'M16A4', 3500.0, true, 1, 550.0, true, 1, 1, 1, 10);

INSERT INTO fuzil_calibre (fuzil_id, calibre_id)
VALUES (1, 1);

INSERT INTO fuzil_mira (fuzil_id, mira_id)
VALUES (1, 1), (1, 2);

-- 5 Calibres
INSERT INTO calibre (nome, marca) VALUES
('5.56x45mm', 'Federal'),
('9x19mm', 'Fiocchi'),
('.30-06', 'Remington'),
('12 Gauge', 'Winchester'),
('.223 Rem', 'Hornady');

-- 5 Carregadores
INSERT INTO carregador (modelo, qtdmunicao, marca) VALUES
('PMAG 30', 30, 'Magpul'),
('Box 20', 20, 'Sauer'),
('Drum 50', 50, 'CProducts'),
('LowCap 10', 10, 'HK'),
('Carregador 15', 15, 'CZ');

-- 5 Endereços (endereços_id presumidos 2..6)
INSERT INTO endereco (rua, bairro, cidade, estado, cep, isprincipal) VALUES
('Av. Tiradentes', 'Bela Vista', 'São Paulo', 'SP', '01000-000', false),
('Rua do Comércio', 'Centro', 'Recife', 'PE', '50000-000', false),
('Rua das Palmeiras', 'Jardim', 'Porto Alegre', 'RS', '90000-000', false),
('Av. Central', 'Boa Vista', 'Manaus', 'AM', '69000-000', false),
('Rua do Porto', 'Industrial', 'Vitória', 'ES', '29000-000', false);

-- 5 Telefones (telefone_id presumidos 2..6)
INSERT INTO telefone (numero) VALUES
('(11) 98888-0001'),
('(81) 97777-0002'),
('(51) 96666-0003'),
('(92) 95555-0004'),
('(27) 94444-0005');

-- 5 Fornecedores (referenciando os endereços/telefones inseridos acima: endereco_id 2..6, telefone_id 2..6)
INSERT INTO fornecedor (nome, cnpj, email, endereco_id, telefone_id, ativo) VALUES
('TiroTech', '21.111.111/0001-11', 'contato@tirotech.com', 2, 2, true),
('SegMun', '32.222.222/0001-22', 'vendas@segmun.com', 3, 3, true),
('DefesaCom', '43.333.333/0001-33', 'comercial@defesacom.com', 4, 4, true),
('Omega Arms', '54.444.444/0001-44', 'suporte@omegaarms.com', 5, 5, true),
('Norte Armas', '65.555.555/0001-55', 'info@nortearmas.com', 6, 6, true);

-- 5 Miras (mira ids presumidos 3..7)
INSERT INTO mira (modelo, marca, aumentomaximo) VALUES
('HawkSight', 'Bushnell', 6),
('EagleView', 'Trijicon', 8),
('MicroDot', 'AimTech', 1),
('ScoutOptic', 'Vortex', 4),
('LongRange 10x', 'Swarovski', 10);

-- Subtipos para algumas miras (usar ids correspondentes: por exemplo, 3=HawkSight, 4=EagleView, 5=MicroDot, 6=ScoutOptic, 7=LongRange)
INSERT INTO miraholografica (id, alcancelaser, visaonoturna) VALUES
(3, 400, false),
(5, 250, true);

INSERT INTO reddot (id, niveisbrilho, duracaobateria) VALUES
(4, 7, 18.0),
(6, 3, 14.0);

-- 5 Registros
INSERT INTO registro (dataregistro, numeroserie) VALUES
('2023-02-15', 'SN002'),
('2023-03-10', 'SN003'),
('2023-04-20', 'SN004'),
('2023-05-05', 'SN005'),
('2023-06-01', 'SN006');

-- 5 Fuzis (associando fornecedor_id 2..6, carregador_id 2..6, registro_id 2..6)
INSERT INTO fuzil (nome, marca, modelo, preco, ativa, mododisparo, alcanceefetivo, possuitrilhotatico, fornecedor_id, carregador_id, registro_id, quantidadedisponivel) VALUES
('FN SCAR-L', 'FN', 'SCAR-L', 7200.0, true, 1, 600.0, true, 2, 2, 2, 10),
('Ruger Mini-14', 'Ruger', 'Mini-14', 4200.0, true, 1, 500.0, false, 3, 3, 3, 15),
('Remington 700 Tactical', 'Savage', 'Tactical', 3800.0, true, 2, 800.0, false, 4, 4, 4, 5),
('HK416', 'Savage', '416', 9500.0, true, 1, 700.0, true, 5, 5, 5, 8),
('Savage 110 Tactical', 'Savage', 'Tactical', 4100.0, true, 2, 750.0, false, 6, 6, 6, 12);


-- Ligações fuzil_calibre (associando cada fuzil a um calibre — calibres inseridos aparecem em ordem: 2..6)
INSERT INTO fuzil_calibre (fuzil_id, calibre_id) VALUES
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6);

-- Ligações fuzil_mira (associando fuzis às miras; ajuste ids conforme sua sequência)
INSERT INTO fuzil_mira (fuzil_id, mira_id) VALUES
(2, 3),
(3, 4),
(4, 6),
(5, 6),
(6, 5);