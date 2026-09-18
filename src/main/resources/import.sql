-- ==============================================================================
-- CARGA INICIAL DE DADOS (import.sql) - E-COMMERCE DE DRONES
-- ==============================================================================

-- 1. Estados
INSERT INTO estado (id, nome) VALUES (1, 'Tocantins');
INSERT INTO estado (id, nome) VALUES (2, 'São Paulo');
INSERT INTO estado (id, nome) VALUES (3, 'Rio de Janeiro');
ALTER SEQUENCE estado_id_seq RESTART WITH 4;

-- 2. Cidades
INSERT INTO cidade (id, nome, estado_id) VALUES (1, 'Palmas', 1);
INSERT INTO cidade (id, nome, estado_id) VALUES (2, 'São Paulo', 2);
INSERT INTO cidade (id, nome, estado_id) VALUES (3, 'Campinas', 2);
INSERT INTO cidade (id, nome, estado_id) VALUES (4, 'Rio de Janeiro', 3);
ALTER SEQUENCE cidade_id_seq RESTART WITH 5;

-- 3. Telefones
INSERT INTO telefone (id, numero) VALUES (1, '(63) 3215-1000');
INSERT INTO telefone (id, numero) VALUES (2, '(11) 3456-7890');
ALTER SEQUENCE telefone_id_seq RESTART WITH 3;

-- 4. Usuários
INSERT INTO usuario (id, login, email, senha_hash, perfil, nomecompleto, cpf, telefone)
VALUES (
    1,
    'rhuan',
    'rhuan@example.com',
    '$2a$10$A3KTUbjTaAi1Gi65/EGEfuaab0vjVsQNmxAqVZTjLrYhiuEQSwkji',
    'ADMIN',
    'Rhuan Administrador',
    '111.222.333-44',
    '(63) 99111-2222'
);

INSERT INTO usuario (id, login, email, senha_hash, perfil, nomecompleto, cpf, telefone)
VALUES (
    2,
    'cliente',
    'cliente@example.com',
    '$2a$10$A3KTUbjTaAi1Gi65/EGEfuaab0vjVsQNmxAqVZTjLrYhiuEQSwkji',
    'CLIENTE',
    'Lucas Silva',
    '555.666.777-88',
    '(63) 98444-5555'
);
ALTER SEQUENCE usuario_id_seq RESTART WITH 3;

-- 5. Endereços
INSERT INTO endereco (id, rua, bairro, cep, cidade_id, isprincipal, usuario_id)
VALUES (1, 'Avenida JK, 150', 'Plano Diretor Sul', '77001-000', 1, true, NULL);

INSERT INTO endereco (id, rua, bairro, cep, cidade_id, isprincipal, usuario_id)
VALUES (2, 'Avenida Paulista, 1000', 'Bela Vista', '01310-100', 2, true, NULL);

INSERT INTO endereco (id, rua, bairro, cep, cidade_id, isprincipal, usuario_id)
VALUES (3, 'Quadra 104 Sul, Rua SE 5, Lote 25', 'Plano Diretor Sul', '77020-018', 1, true, 2);
ALTER SEQUENCE endereco_id_seq RESTART WITH 4;

-- Atualizar endereço principal do usuário cliente
UPDATE usuario SET enderecoprincipalid = 3 WHERE id = 2;

-- 6. Fornecedores
INSERT INTO fornecedor (id, nome, cnpj, email, telefone, ativo, endereco_id)
VALUES (1, 'FlyTech Distribuidora de Drones', '11.222.333/0001-81', 'contato@flytech.com.br', '(63) 3215-1000', true, 1);

INSERT INTO fornecedor (id, nome, cnpj, email, telefone, ativo, endereco_id)
VALUES (2, 'AeroBrasil Tecnologia', '22.333.444/0001-81', 'contato@aerobrasil.com.br', '(11) 3456-7890', true, 2);
ALTER SEQUENCE fornecedor_id_seq RESTART WITH 3;

-- 7. Câmeras
INSERT INTO camera (id, modelo, marca, resolucao, zoom, estabilizacao, fps)
VALUES (1, 'DJI 4K HDR Mini', 'DJI', '4K / 60fps', 4, true, '60fps');

INSERT INTO camera (id, modelo, marca, resolucao, zoom, estabilizacao, fps)
VALUES (2, 'Dual Camera 4K Wide + Tele', 'DJI', '4K / 100fps', 9, true, '100fps');

INSERT INTO camera (id, modelo, marca, resolucao, zoom, estabilizacao, fps)
VALUES (3, 'Autel 6K Super-Resolution', 'Autel Robotics', '6K / 30fps', 16, true, '30fps');

INSERT INTO camera (id, modelo, marca, resolucao, zoom, estabilizacao, fps)
VALUES (4, 'Hasselblad 4/3 CMOS Tri-Camera', 'Hasselblad', '5.1K / 50fps', 28, true, '120fps');
ALTER SEQUENCE camera_id_seq RESTART WITH 5;

-- 8. Promoções
INSERT INTO promocao (id, nome, percentualdesconto, datainicio, datafim)
VALUES (1, 'Semana do Consumidor', 10.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59');

INSERT INTO promocao (id, nome, percentualdesconto, datainicio, datafim)
VALUES (2, 'Queima de Estoque', 15.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59');
ALTER SEQUENCE promocao_id_seq RESTART WITH 3;

-- 9. Drones (4 drones cadastrados)
-- Drone 1: DJI Mini 4 Pro
INSERT INTO drone (
    id, nome, marca, modelo, preco, quantidadedisponivel, ativa,
    tempovoopratico, pesodecolagem, altitudemaxima, velocidademaxima, alcancetransmissao,
    possuicamera, quantidademotores, comcontroleremoto, controladoporaplicativo,
    quantidadebaterias, duracaobateria, frequenciawifi, possuigps,
    fornecedor_id, camera_id, promocao_id
) VALUES (
    1, 'Drone DJI Mini 4 Pro', 'DJI', 'Mini 4 Pro Fly More', 6499.00, 15, true,
    34, 249.0, 4000, 58, 20000,
    true, 4, true, true,
    3, '34 minutos', '2.4 GHz, 5.8 GHz', true,
    1, 1, 1
);

-- Drone 2: DJI Air 3
INSERT INTO drone (
    id, nome, marca, modelo, preco, quantidadedisponivel, ativa,
    tempovoopratico, pesodecolagem, altitudemaxima, velocidademaxima, alcancetransmissao,
    possuicamera, quantidademotores, comcontroleremoto, controladoporaplicativo,
    quantidadebaterias, duracaobateria, frequenciawifi, possuigps,
    fornecedor_id, camera_id, promocao_id
) VALUES (
    2, 'Drone DJI Air 3', 'DJI', 'Air 3 Fly More Combo', 10899.00, 8, true,
    46, 720.0, 6000, 75, 20000,
    true, 4, true, true,
    3, '46 minutos', '2.4 GHz, 5.1 GHz, 5.8 GHz', true,
    1, 2, NULL
);

-- Drone 3: Autel EVO Lite+
INSERT INTO drone (
    id, nome, marca, modelo, preco, quantidadedisponivel, ativa,
    tempovoopratico, pesodecolagem, altitudemaxima, velocidademaxima, alcancetransmissao,
    possuicamera, quantidademotores, comcontroleremoto, controladoporaplicativo,
    quantidadebaterias, duracaobateria, frequenciawifi, possuigps,
    fornecedor_id, camera_id, promocao_id
) VALUES (
    3, 'Drone Autel EVO Lite+', 'Autel Robotics', 'EVO Lite+ Premium', 8499.00, 6, true,
    40, 835.0, 5000, 65, 12000,
    true, 4, true, true,
    2, '40 minutos', '2.4 GHz, 5.8 GHz', true,
    2, 3, 2
);

-- Drone 4: DJI Mavic 3 Pro
INSERT INTO drone (
    id, nome, marca, modelo, preco, quantidadedisponivel, ativa,
    tempovoopratico, pesodecolagem, altitudemaxima, velocidademaxima, alcancetransmissao,
    possuicamera, quantidademotores, comcontroleremoto, controladoporaplicativo,
    quantidadebaterias, duracaobateria, frequenciawifi, possuigps,
    fornecedor_id, camera_id, promocao_id
) VALUES (
    4, 'Drone DJI Mavic 3 Pro', 'DJI', 'Mavic 3 Pro Cine', 18999.00, 4, true,
    43, 958.0, 6000, 76, 15000,
    true, 4, true, true,
    3, '43 minutos', '2.4 GHz, 5.8 GHz', true,
    2, 4, NULL
);
ALTER SEQUENCE drone_id_seq RESTART WITH 5;

-- 10. Avaliações
INSERT INTO avaliacao (id, nota, comentario, dataavaliacao, usuario_id, drone_id)
VALUES (1, 5, 'Drone excelente! Estabilidade impecável e qualidade de imagem profissional.', '2026-03-01 10:30:00', 2, 1);

INSERT INTO avaliacao (id, nota, comentario, dataavaliacao, usuario_id, drone_id)
VALUES (2, 5, 'A teleobjetiva do Air 3 traz um diferencial absurdo para filmagens cinematográficas.', '2026-03-05 14:15:00', 2, 2);
ALTER SEQUENCE avaliacao_id_seq RESTART WITH 3;

-- 11. Favoritos
INSERT INTO favoritos (id, usuario_id, drone_id) VALUES (1, 2, 1);
INSERT INTO favoritos (id, usuario_id, drone_id) VALUES (2, 2, 4);
ALTER SEQUENCE favoritos_id_seq RESTART WITH 3;

-- 12. Pedidos, Itens e Pagamentos
-- Pedido 1 (Pago via PIX)
INSERT INTO pedido (id, datapedido, valortotal, statuspedido, usuario_id, ruaentrega, bairroentrega, cidadeentrega, estadoentrega, cepentrega)
VALUES (1, '2026-03-10 15:20:00', 6499.00, 'PAGO', 2, 'Quadra 104 Sul, Rua SE 5, Lote 25', 'Plano Diretor Sul', 'Palmas', 'TO', '77020-018');

INSERT INTO itempedido (id, quantidade, precounitario, drone_id, pedido_id)
VALUES (1, 1, 6499.00, 1, 1);

INSERT INTO pagamento (id, valor, statuspagamento, pedido_id)
VALUES (1, 6499.00, 'APROVADO', 1);

INSERT INTO pagamentopix (id, chavepix)
VALUES (1, 'cliente@example.com');

-- Pedido 2 (Pago via Cartão de Crédito)
INSERT INTO pedido (id, datapedido, valortotal, statuspedido, usuario_id, ruaentrega, bairroentrega, cidadeentrega, estadoentrega, cepentrega)
VALUES (2, '2026-03-12 11:00:00', 10899.00, 'PAGO', 2, 'Quadra 104 Sul, Rua SE 5, Lote 25', 'Plano Diretor Sul', 'Palmas', 'TO', '77020-018');

INSERT INTO itempedido (id, quantidade, precounitario, drone_id, pedido_id)
VALUES (2, 1, 10899.00, 2, 2);

INSERT INTO pagamento (id, valor, statuspagamento, pedido_id)
VALUES (2, 10899.00, 'APROVADO', 2);

INSERT INTO pagamentocartao (id, numerocartao, nometitular, datavalidade, codigoseguranca)
VALUES (2, '4111111111111111', 'LUCAS SILVA', '12/29', '123');

ALTER SEQUENCE pedido_id_seq RESTART WITH 3;
ALTER SEQUENCE itempedido_id_seq RESTART WITH 3;
ALTER SEQUENCE pagamento_id_seq RESTART WITH 3;


