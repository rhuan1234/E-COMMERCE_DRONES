# BRIEF — Nova landing page Skyline Drones

> Gerado na entrevista da skill *Sites Incríveis* em 2026-11-09.
> Rota: `/` (componente `features/ecommerce/components/landing`).

## As 7 respostas

1. **O que é e pra quem** — Skyline Drones, loja especializada em drones, câmeras e
   acessórios, que vende pela ficha técnica e aceita PIX ou cartão. Projeto acadêmico.
   **Público principal: o entusiasta que vai comprar o primeiro drone.**
2. **Vibe** — "Primeiro voo": emoção, liberdade, céu aberto, descoberta.
   Referências: o filme *Up*; o primeiro dia com a carteira de motorista; um mirante ao amanhecer.
3. **Caminho** — chão → decolagem → números viram sensação → tipos de voo → como comprar → pouso.
4. **Crença final** — *"Voar está mais perto do que eu pensava."*
5. **Energia e pico** — calma no chão, intensa na decolagem, calma na escolha, firme no pouso.
   **Pico: a decolagem.**
6. **Movimento-assinatura** — altímetro de rolagem (0 → 120 m, teto da ANAC para uso
   recreativo) + hélices que giram conforme a velocidade da rolagem no pico.
7. **Materiais** — identidade Skyline completa (paleta, Archivo/Roboto Flex/JetBrains Mono,
   SVG do drone, curvas de nível); dados reais pela API (drones, fichas, preços, avaliações).
   **Fotos: o dono vai trazer** (lista abaixo). Um depoimento **fictício** na cena 5 (a gestão pelo admin ficou para depois).

## Jornada em 7 cenas

| # | Cena | O que VÊ | O que SENTE | O que passa a ACREDITAR | Energia | Efeito (família) |
|---|---|---|---|---|---|---|
| 1 | **Chão** | Foto de amanhecer/campo, drone parado; título "Você ainda não voou." montando palavra a palavra; altímetro em `0 m` | expectativa | "isso é pra mim" | calma | Texto que se monta (`palavras`) |
| 2 | **Decolagem — PICO** | Cena fixa de ~5 telas: o drone sobe, hélices aceleram com a rolagem, o chão (foto) encolhe e vira mapa de curvas de nível; frases curtas aparecem uma após a outra; altímetro corre até 120 m | frio na barriga, liberdade | "voar é isso" | **intensa** | Cena fixa + interpolação + assinatura |
| 3 | **Os números viram sensação** | Fundo vira `ink` (noite/instrumentos). Ficha do drone em destaque (da API): "**31** minutos no ar", "**10** km de horizonte", "**249** g na mão" + preço | surpresa boa | "cabe no meu bolso e na minha mochila" | média | Números que sobem (`contar`) + fundo que viaja |
| 4 | **Escolha o seu voo** | Os 4 tipos de voo (`TIPOS_DE_VOO`) num trilho horizontal com foto de cada um; cada cartão leva ao catálogo filtrado | identificação | "existe o meu" | calma | Trilho horizontal (cena fixa curta) |
| 5 | **Quem já voou** | Fundo `mist`. Um depoimento (fictício, ver abaixo) grande e digitado, com nota em estrelas e nome | confiança | "gente como eu conseguiu" | média | Texto `digitar` + revelação `crescer` |
| 6 | **Da escolha ao voo** | 3 etapas (Compare → Salve → Pague com PIX/cartão), uma por vez, com o altímetro descendo | leveza | "comprar é simples" | média-baixa | Etapas (cena fixa) |
| 7 | **Pouso** | Fundo `ink`, foto de horizonte ao entardecer; "Voar está mais perto do que você pensava." + UMA chamada: **Explorar catálogo**; altímetro volta a `0 m` | resolução | **a crença final** | média, firme | Fundo que viaja + `palavras` (2º e último uso) |

Nenhuma cena vizinha repete família de efeito. Os 4 tipos (trilho) e os 3 passos (etapas) são cenas fixas, mas não são vizinhas.

## Curva de energia

```
intensa  |      ██
         |      ██
média    |      ██  ██      ██          ██
         |  ██  ██  ██      ██  ██      ██
calma    |  ██  ██  ██  ██  ██  ██  ██  ██
         +---1---2---3---4---5---6---7---
```

## Paleta (identidade Skyline mantida)

- Fundo: `paper #f7f9f6` · Superfície: `white` / `mist #eef3ea` · Tinta: `ink #17211b` · Tinta suave: `muted #4a574e`
- Cenas escuras: `night #121a15` / `ink`
- **Acento único: `lime-glow #b7ee75` (no escuro) / `lime #8cc63f` (no claro)**, usado só no CTA, no altímetro e nos números do pico.
- `leaf #3f6a1e` para detalhes em fundo claro (texto de apoio, ícones).
- Tipografia: Archivo expandida (display) · Roboto Flex (texto) · JetBrains Mono (altímetro, fichas, números).

## Fotos necessárias (o dono vai trazer)

Colocar em `frontend/public/landing/` (`.webp` ou `.jpg`, ~2400 px de largura, horizontal):

| Arquivo | Uso | Descrição |
|---|---|---|
| `chao.webp` ✅ | Cena 1 e início do pico | Campo/mirante ao amanhecer, visto do chão, com céu aberto em cima (espaço livre para o título) |
| `aerea.webp` ✅ | Cena 2 (pico) | **O mesmo tipo de paisagem visto de cima**, bem alto (vista zenital/aérea). Quanto mais parecida com `chao.jpg`, melhor a ilusão da subida |
| `tipo-primeiro-voo.jpg` | Cena 4 | Pessoa iniciante pilotando num parque/campo |
| `tipo-viagem.jpg` | Cena 4 | Paisagem de viagem (praia, montanha, estrada) |
| `tipo-cinema.jpg` | Cena 4 | Plano cinematográfico aéreo (cidade, cachoeira) |
| `tipo-longo-alcance.jpg` | Cena 4 | Horizonte amplo, lago/serra a perder de vista |
| `pouso.jpg` | Cena 7 | Horizonte ao entardecer (céu quente, silhueta) |

Fotos sem texto nem logotipos. `chao.webp` e `aerea.webp` foram geradas (WebP, ~190 KB) a partir dos originais enviados (`aerea.jpg` = vista do chão, `ceu.jpg` = vista aérea; PNGs de 2,3 MB que podem ser removidos). Até elas chegarem, a página usa SVG/cor sólida no lugar, e nada fica quebrado.

## Avaliação em destaque (decisão do dono)

A gestão de destaques pelo admin foi **adiada**. A cena 5 usa **um depoimento fictício**
fixo, a pedido do dono (projeto acadêmico), isolado na constante `DEPOIMENTO_FICTICIO`
de `landing.ts`, para ser trocado por uma avaliação real no futuro. Sem mudança de backend.

## Decisão técnica — motor de rolagem no Angular

O motor `sites-incriveis.js` é um script que varre a página uma vez ao carregar. Numa SPA
Angular, a landing nasce e morre a cada navegação, então o script não "vê" a página nem limpa os
listeners. Por isso o motor será **portado para uma diretiva/serviço Angular** com a **mesma API de
atributos `data-fx-*`** e o mesmo CSS (com os avisos de autoria preservados), que se arma em
`ngAfterViewInit` e se desarma em `ngOnDestroy`. O comportamento (inclusive `prefers-reduced-motion`)
é idêntico.

## Fase 2 (depois da landing)

Atualizar layout e design do restante (navbar/footer, catálogo `/home`, `drone-info`, carrinho,
comparar, favoritos, minha conta, login/cadastro e admin) mantendo a identidade Skyline, com a mesma
linguagem visual da nova landing, mas **sem** scrollytelling nas telas de tarefa (catálogo, checkout,
admin), onde o movimento atrapalharia.
