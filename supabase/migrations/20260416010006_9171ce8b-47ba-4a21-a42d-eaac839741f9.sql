
-- Function to seed default data for new personal trainers
CREATE OR REPLACE FUNCTION public.seed_new_personal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := NEW.id;
  v_tag_pant uuid;
  v_tag_sup uuid;
  v_tag_inf uuid;
  v_tm_ordinaria uuid;
  v_tm_choque uuid;
  v_tm_resistencia uuid;
  v_perio_id uuid;
BEGIN
  -- Skip if user is an invited student
  IF (NEW.raw_user_meta_data->>'invited_as') = 'aluno' THEN
    RETURN NEW;
  END IF;

  -- =============================================
  -- 1. ALONGAMENTO TAGS
  -- =============================================
  INSERT INTO alongamento_tags (user_id, nome) VALUES (v_user_id, 'PANTURRILHAS') RETURNING id INTO v_tag_pant;
  INSERT INTO alongamento_tags (user_id, nome) VALUES (v_user_id, 'SUPERIORES') RETURNING id INTO v_tag_sup;
  INSERT INTO alongamento_tags (user_id, nome) VALUES (v_user_id, 'INFERIORES') RETURNING id INTO v_tag_inf;

  -- =============================================
  -- 2. ALONGAMENTOS
  -- =============================================
  -- PANTURRILHAS tag
  INSERT INTO alongamentos (user_id, tag_id, descricao, grupo_muscular, forma_execucao, musculos_envolvidos, observacoes, link_video) VALUES
  (v_user_id, v_tag_pant, 'PANTURRILHAS | GERAL', 'Panturrilhas', 'Ficar em pé de frente para o espaldar a um passo longo, com o tronco ereto, abdômen contraído e pés na largura dos quadris, levar uma das pernas à frente, inclinando o tronco e apoiando as mãos no espaldar, mantendo o calcanhar da perna de trás apoiado no chão até sentir o alongamento na parte posterior alta da perna. Sustentar a posição pelo tempo indicado.', 'Gastrocnêmios medial e lateral, sóleo, tibial posterior, fibular longo e curto, plantar (débil), flexor longo dos dedos dos pés e flexor longo do hálux.', 'Corrigir o aparecimento de pronação compensatória durante a execução, e/ou acentuação da lordose lombar.', 'https://www.youtube.com/watch?v=4KU1kN50MnE&feature=youtu.be'),
  (v_user_id, v_tag_pant, 'PANTURRILHAS | SÓLEO', 'Panturrilhas', 'Ficar em pé, de frente para o espaldar com os pés na largura dos quadris e mãos apoiadas no espaldar. Afastar uma das pernas para trás a uma distância de um passo, mantendo o calcanhar no chão e flexionar o joelho até sentir o alongamento na parte posterior baixa da perna. Sustentar a posição pelo tempo indicado.', 'Sóleo, tibial posterior, fibular longo e curto, plantar (débil), flexor longo dos dedos dos pés e flexor longo do hálux.', 'Observar o aparecimento de pronação compensatória durante a execução.', NULL),
  (v_user_id, v_tag_pant, 'PANTURRILHAS | NO BANCO OU STEP', 'Panturrilhas', 'Fique com uma das pernas em cima de um step ou um banco e deixe o peso do corpo sobre ela, mantendo o pé na largura dos quadris e as mãos apoiadas no banco ou step. É importante manter o calcanhar apoiado sem levantá-lo. Afaste a outra perna para trás em uma posição confortável, mantendo a ponta do pé no chão. Sustente essa posição pelo tempo indicado.', 'Sóleo, tibial posterior, fibular longo e curto, músculo plantar (débil), flexor longo dos dedos dos pés e flexor longo do hálux.', 'Corrija qualquer pronação compensatória que possa ocorrer durante a execução do exercício e/ou evite acentuar a lordose lombar.', NULL);

  -- INFERIORES tag
  INSERT INTO alongamentos (user_id, tag_id, descricao, grupo_muscular, forma_execucao, musculos_envolvidos, observacoes, link_video) VALUES
  (v_user_id, v_tag_inf, 'ILIOPSOAS | DECÚBITO DORSAL', 'Perna', 'Manter escápulas no chão, queixo baixo, pelve em neutro e os pés apontados para cima. Flexionar um dos joelhos e, com as duas mãos apoiadas sobre a tuberosidade da tíbia, puxar a coxa de encontro ao tronco até sentir o alongamento do iliopsoas no membro contralateral. Sustentar a posição pelo tempo indicado.', 'Ênfase sobre iliopsoas e leve sobre reto femoral, tensor da fáscia lata, sartório, pectíneo, adutor longo e grácil.', 'Observar para que não haja inclinação pélvica lateral, hiperlordose cervical e protusão dos ombros.', NULL),
  (v_user_id, v_tag_inf, 'ILIOPSOAS | AJOELHADO', 'Perna', 'Ficar de joelhos sobre um colchonete com o tronco ereto e abdômen contraído. Levar uma das pernas à frente, mantendo uma flexão deste joelho em torno de 90°. Apoiar as mãos numa das barras, manter tronco ereto e fazer uma ligeira pressão no quadril para baixo até sentir o estiramento do iliopsoas da perna que está no chão. Manter a postura pelo tempo indicado.', 'Ênfase sobre iliopsoas, reto femoral, pectíneo, adutor longo; leve sobre tensor da fáscia lata, sartório e grácil.', 'Estabilizar a pelve, não permitindo o aumento da lordose fisiológica e/ou a flexão anterior do tronco.', 'https://www.youtube.com/watch?v=zEuL2azL7-Y&feature=youtu.be'),
  (v_user_id, v_tag_inf, 'ILIOPSOAS | DE PÉ NO ESPALDAR', 'Perna', 'Ficar de frente para o espaldar, a uma distância de um passo largo com os pés na largura dos quadris. Apoiar um dos pés numa barra do espaldar de modo que seja feita uma flexão de joelhos de aproximadamente 90°. Apoiar as mãos no espaldar para dar sustentação ao tronco, fazer uma leve pressão no quadril para baixo até sentir o estiramento do iliopsoas da perna que está no chão. Sustentar a postura pelo tempo indicado.', 'Iliopsoas, reto femoral, tensor da fáscia lata, sartório, pectíneo, adutor longo e grácil.', 'Manter o joelho do membro a ser alongado estendido (sem o bloqueio articular) e sem rotação externa de quadril.', NULL),
  (v_user_id, v_tag_inf, 'ISQUIOTIBIAIS | DECÚBITO DORSAL', 'Posterior de coxa', 'Manter escápulas no chão com o queixo baixo, pelve em neutro e os pés apontados para cima. Flexionar um dos quadris, mantendo os joelhos estendidos, mas não encaixados. Com o auxílio de uma corda apoiada na sola do pé, puxar a perna de encontro ao tronco até sentir o alongamento da parte posterior da coxa. Sustentar a posição pelo tempo indicado.', 'Glúteo máximo, bíceps femoral, semitendinoso, semimembranoso e porção extensora do adutor magno.', 'Não permitir a inclinação pélvica, retroversão excessiva e hiperlordose cervical.', 'https://www.youtube.com/watch?v=dZwvpEy6XHU'),
  (v_user_id, v_tag_inf, 'ISQUIOTIBIAIS | NO ESPALDAR', 'Posterior de coxa', 'Manter as pernas estendidas à frente. Flexionar o quadril sobre as pernas até sentir o alongamento na parte posterior da coxa e permitir uma pequena flexão do tronco. Sustentar a posição pelo tempo indicado.', 'Glúteo máximo, bíceps femoral, semitendinoso, semimembranoso e porção extensora do adutor magno.', 'Observar a homogeneidade da curvatura tóracolombar.', 'https://www.youtube.com/watch?v=n2y2nsL3xGY&feature=youtu.be'),
  (v_user_id, v_tag_inf, 'ISQUIOTIBIAIS | UNILATERAL EM DIAGONAL', 'Posterior de coxa', 'Sentar com pernas afastadas a 45°, flexionar um dos joelhos apoiando a coxa em rotação externa no chão e o pé tocando à altura do joelho da perna estendida. Flexionar o tronco sobre a coxa estendida, tentando chegar o mais próximo possível do pé com a mão oposta.', 'No quadril: ênfase em semitendinoso e semimembranoso e mais a porção extensora do adutor magno. Na coluna: paravertebrais contralaterais e quadrado lombar.', 'Observar a homogeneidade da curvatura tóracolombar, evitando uma curvatura excessiva em qualquer segmento da coluna.', NULL),
  (v_user_id, v_tag_inf, 'ISQUIOTIBIAIS | UNILATERAL DIRETO À FRENTE', 'Posterior de coxa', 'Sentar com as pernas à frente, flexionar um dos joelhos apoiando a coxa em rotação externa no chão e o pé tocando à altura do tornozelo da perna estendida, de modo que o quadril continue alinhado à frente. Flexionar o tronco sobre a perna estendida, tentando chegar o mais próximo possível do pé com a mão oposta.', 'No quadril: glúteo máximo, bíceps femoral, semitendinoso, semimembranoso e porção extensora do adutor magno. Na coluna: paravertebrais bilaterais.', 'Observar a homogeneidade da curvatura tóraco-lombar e manter a pelve rigorosamente para frente.', NULL),
  (v_user_id, v_tag_inf, 'ISQUIOTIBIAIS | BILATERAL C/ PERNAS FECHADAS', 'Posterior de coxa', 'Sentar com as pernas estendidas à frente, flexionar o quadril à frente, mantendo o tronco ereto, até sentir o alongamento na parte posterior destas. Sustentar a posição pelo tempo indicado.', 'No quadril: glúteo máximo, bíceps femoral, semitendinoso, semimembranoso e porção extensora do adutor magno.', 'Alguns indivíduos apresentam um encurtamento tão significativo dos músculos posteriores que são incapazes de se sentarem no chão nesta posição e manter a pelve em neutro.', 'https://www.youtube.com/watch?v=MarWgcyIxk0'),
  (v_user_id, v_tag_inf, 'ISQUIOTIBIAIS | BILATERAL C/ PERNAS AFASTADAS', 'Posterior de coxa', 'Sentar com as pernas afastadas cada uma a, no mínimo, 45° do eixo mediano. Flexionar o quadril entre as coxas até sentir o alongamento da parte posterior e mais medial das coxas. Manter a coluna ereta preservando as curvaturas fisiológicas.', 'Ênfase sobre semitendinoso, semimembranoso e porção extensora do adutor magno.', 'Numa abertura total maior do que 160° começa a perder a ênfase muscular esperada.', 'https://www.youtube.com/watch?v=37zOkaWXLvM'),
  (v_user_id, v_tag_inf, 'ISQUIOTIBIAIS | NO ESPALDAR (EM PÉ)', 'Posterior de coxa', 'Ficar a uma distância de um passo do espaldar com o tronco ereto, preservando as curvaturas da coluna e pelve em neutro. Manter os pés e os quadris apontados para frente, flexionar um dos quadris mantendo a extensão do joelho e apoiar o calcanhar desta sobre uma barra do espaldar, formando um ângulo entre 90° a 120° de flexão de quadril, até o alongamento da parte posterior da coxa.', 'Glúteo máximo, bíceps femoral, semitendinoso, semimembranoso e porção extensora do adutor magno.', 'Tentar apoiar a perna muito alta pode provocar a inclinação do quadril tirando de linha a musculatura que se está tentando trabalhar.', NULL),
  (v_user_id, v_tag_inf, 'ADUTORES | SENTADO', 'Adutores', 'Sentar sobre o colchonete com o tronco ereto, pelve em neutro, joelhos fletidos a um ângulo menor que 90°, coxas em rotação externa e a sola dos pés apoiada uma na outra. Contrair os abdutores do quadril até sentir o alongamento da musculatura interna das coxas.', 'Pectíneo, adutor curto, adutor longo, adutor magno e grácil.', 'Preservar a pelve em neutro.', 'https://www.youtube.com/watch?v=tNHc-ojssNs'),
  (v_user_id, v_tag_inf, 'ADUTORES | DECÚBITO DORSAL', 'Adutores', 'Deitar sobre o colchonete com a pelve em neutro, escápulas apoiadas no chão, queixo para dentro, joelhos fletidos a um ângulo menor que 90°, coxas em rotação externa e as solas dos pés apoiada uma na outra. Contrair os abdutores do quadril até sentir o alongamento da musculatura interna das coxas.', 'Pectíneo, adutor curto, adutor longo, adutor magno e grácil.', 'Esta variação apresenta uma maior tensão de estiramento sobre os músculos citados.', NULL),
  (v_user_id, v_tag_inf, 'ADUTORES | SAPINHO', 'Adutores', 'Ficar de joelhos no chão, com os joelhos fletidos a 90°. Apoiar o cotovelo no chão a 90°, afaste as pernas para alongar os adutores.', 'Pectíneo, adutor curto, adutor longo, adutor magno e grácil.', 'Mantenha as curvaturas fisiológicas preservadas.', NULL),
  (v_user_id, v_tag_inf, 'GLÚTEOS | DECÚBITO DORSAL', 'Glúteo', 'Deitar sobre o colchonete com a pelve em neutro, escápulas apoiadas no chão e queixo para dentro. Flexionar os quadris sobre o tronco e cruzar as pernas apoiando o tornozelo de uma perna sobre o terço distal da outra coxa. Com as mãos por trás da perna em flexão, puxar esta na direção do peito até sentir o alongamento do glúteo da coxa contralateral.', 'Glúteo máximo (alguma coisa de seus feixes inferiores), algum trabalho sobre glúteo médio (porção anterior) e glúteo mínimo.', 'É muito comum observar indivíduos extremamente encurtados e que para se colocarem nesta posição fazem vários movimentos compensatórios.', 'https://www.youtube.com/watch?v=ruVawdlKPRY'),
  (v_user_id, v_tag_inf, 'GLÚTEOS | PIRIFORME', 'Glúteo', 'Deitar sobre o colchonete com a pelve em neutro, escápulas apoiadas no chão e queixo para dentro. Flexionar os quadris sobre o tronco e cruzar as pernas, apoiando a parte posterior de um joelho sobre o terço distal da outra coxa. O treinador apoia a mão sobre o joelho da perna de cima e a empurra na direção do ombro oposto até o aluno sentir um alongamento profundo no glúteo desta coxa.', 'Glúteo máximo (especialmente feixes médio-inferiores), piriforme e obturatório interno.', 'Observar para que não aconteça uma retroversão pélvica durante o exercício.', NULL),
  (v_user_id, v_tag_inf, 'GLÚTEOS | NO ESPALDAR', 'Glúteo', 'Ficar em pé de frente, a uma distância de um passo do espaldar com o tronco ereto. Manter as curvaturas fisiológicas da coluna e o queixo para dentro. Flexionar o joelho algo em torno de 45° e apoiar a lateral desta perna sobre uma barra do espaldar, mantendo o quadril em rotação externa.', 'Glúteo máximo (especialmente feixes inferiores), algum trabalho sobre glúteo médio e mínimo.', 'É um exercício de postura difícil de ser sustentada, portanto, não é indicado para indivíduos muito encurtados.', 'https://www.youtube.com/watch?v=iUjC_ZiWyTg'),
  (v_user_id, v_tag_inf, 'GLÚTEOS | GLÚTEO EM L', 'Glúteo', 'Posicione-se com os joelhos apoiados em um colchonete ou superfície macia. Conduza uma das pernas para trás, formando um ângulo de 90 graus no joelho, de modo a criar um formato de L com a perna.', 'Glúteo máximo (alguma coisa de seus feixes inferiores), algum trabalho sobre glúteo médio (porção anterior), glúteo mínimo e iliopsoas.', 'Alguns indivíduos podem apresentar um encurtamento significativo dos músculos glúteos ou flexores do quadril.', NULL),
  (v_user_id, v_tag_inf, 'BANDA ILIOTIBIAL | DECÚBITO DORSAL', 'Glúteo', 'Deitar sobre o colchonete com a pelve em neutro, queixo para dentro e escápulas no chão. O treinador segura uma perna estendida, em ligeira rotação externa e faz uma pequena flexão de quadril, suficiente para permitir uma adução desta além da linha mediana do corpo.', 'De ação sobre a banda iliotibial: feixes superiores do glúteo máximo e tensor da fáscia lata (mais leve). De ação sobre o quadril: glúteo médio (feixes médio e posterior) glúteo mínimo.', 'Observar uma forte estabilização pélvica para que não aconteça uma inclinação desta.', 'https://www.youtube.com/watch?v=MbO9a806598'),
  (v_user_id, v_tag_inf, 'BANDA ILIOTIBIAL | NO ESPALDAR', 'Glúteo', 'Ficar em pé de frente para o espaldar a uma distância de um passo com o tronco ereto e pelve em neutro. Flexionar um dos quadris, aduzindo-o sobre a linha média corporal e apoiando o calcanhar numa barra do espaldar abaixo da linha dos quadris.', 'De ação sobre a banda iliotibial: feixes superiores do glúteo máximo, tensor da fáscia lata (leve). De ação sobre o quadril: glúteo médio (feixes médio e posterior) e glúteo mínimo.', 'A linha de eixo postural deve ser mantida sobre a perna de apoio.', NULL),
  (v_user_id, v_tag_inf, 'BANDA ILIOTIBIAL | SEM AJUDA', 'Glúteo', 'Deitar sobre o colchonete com a pelve em neutro, queixo para dentro e escápulas no chão. Segure uma perna flexionada e faça uma pequena flexão de quadril, suficiente para permitir uma adução desta além da linha mediana do corpo.', 'De ação sobre a Banda Iliotibial: feixes superiores do glúteo máximo e tensor da fáscia lata (mais leve).', 'Observar uma forte estabilização pélvica para que não aconteça uma inclinação desta.', NULL),
  (v_user_id, v_tag_inf, 'RETO FEMORAL | NO ESPALDAR C/ LIMITAÇÃO', 'Quadriceps', 'Ficar em pé de costas para o espaldar, a uma distância de um passo, com o tronco ereto e pelve em neutro. Flexionar um dos joelhos num ângulo de aproximadamente 90° e apoiar o peito do pé sobre a barra do espaldar, mantendo tal ângulo.', 'Reto femoral e pouco envolvimento dos vastos lateral, medial e intermédio.', 'Evitar o aparecimento de uma hiperlordose lombar e/ou inclinação pélvica.', NULL),
  (v_user_id, v_tag_inf, 'RETO FEMORAL | NO ESPALDAR S/ LIMITAÇÃO', 'Quadriceps', 'Ficar em pé de costas para o espaldar, a uma distância de um passo, com o tronco ereto e pelve em neutro. Flexionar um dos joelhos num ângulo agudo e apoiar o peito do pé sobre a barra do espaldar, mantendo tal ângulo.', 'Grande solicitação de reto femoral e dos vastos lateral, medial e intermédio.', 'Evitar o aparecimento de uma hiperlordose lombar e/ou inclinação pélvica.', NULL),
  (v_user_id, v_tag_inf, 'RETO FEMORAL | AJOELHADO', 'Quadriceps', 'Ficar de costas para o espaldar com um dos joelhos no colchonete e o outro em flexão de 90° com o pé no chão. Deixar as mãos na perna da frente, tronco ereto e pelve em neutro.', 'Grande solicitação de reto femoral e dos vastos lateral, medial e intermédio.', 'Não apoiar sobre a patela e sim sobre a borda do fêmur. Manter o alinhamento articular.', 'https://www.youtube.com/watch?v=1HynWqHUcDg'),
  (v_user_id, v_tag_inf, 'ROTAÇÃO DE QUADRIL | EM L', 'Glúteo', 'Deite-se em um colchonete e abra ambos os braços a um ângulo de 90º, com as palmas das mãos para cima. Flexione uma das pernas até fazer um ângulo de 90º de flexão de quadril e coloque-a sobre a outra, realizando uma rotação da coluna vertebral.', 'Feixes superiores do glúteo máximo, tensor da fáscia lata, rotadores, oblíquo externo, oblíquo interno e multifido.', 'Mantenha os braços no chão e evite movimentar a coluna torácica.', NULL);

  -- SUPERIORES tag
  INSERT INTO alongamentos (user_id, tag_id, descricao, grupo_muscular, forma_execucao, musculos_envolvidos, observacoes, link_video) VALUES
  (v_user_id, v_tag_sup, 'PARAVERTEBRAIS | C/ BANDA ILIOTIBIAL', 'Costas', 'Sentar sobre o colchonete com o tronco ereto, joelhos fletidos a um ângulo ligeiramente maior que 90°, com as coxas em rotação externa e pés apoiados um no outro. Flexionar o quadril, segurando nos pés, permitindo uma pequena flexão do tronco até sentir o alongamento dos paravertebrais e dos glúteos.', 'Paravertebrais e feixes superiores do glúteo máximo (os quais tracionam a banda iliotibial).', 'Observar a homogeneidade da curvatura toracolombar.', 'https://www.youtube.com/watch?v=6s6xBuE5ktw'),
  (v_user_id, v_tag_sup, 'PARAVERTEBRAIS | C/ ISQUIOTIBIAIS', 'Costas', 'Sentar com as pernas estendidas à frente. Flexionar o quadril sobre as pernas até sentir o alongamento da parte posterior da coxa e permitir uma pequena flexão do tronco. Sustentar a posição pelo tempo indicado.', 'No quadril: glúteo máximo, bíceps femoral, semitendinoso, semimembranoso e porção extensora do adutor magno.', 'Observar a homogeneidade da curvatura tóraco-lombar.', NULL),
  (v_user_id, v_tag_sup, 'ROTAÇÃO TORÁXICA | 3 APOIOS', 'Costas', 'Posição inicial: Ficar de joelhos no chão, com os joelhos fletidos a 90°. Apoiar o cotovelo no chão a 90°. Posição final: Apoie um dos cotovelos no chão e realize a rotação da coluna com outro braço.', 'Rotadores, multífido, oblíquo externo atuando sincronicamente com oblíquo interno do lado oposto.', 'Não permitir excessiva rotação de quadril.', NULL),
  (v_user_id, v_tag_sup, 'COLUNA | ROTAÇÃO EM PÉ', 'Costas', 'Ficar em pé, deixar o braço ao lado da parede estendido durante todo o movimento. Encostar o braço contrário na parede realizando a rotação da coluna.', 'Rotadores, multífido, oblíquo externo atuando sincronicamente com oblíquo interno do lado oposto.', 'Não permitir excessiva rotação de quadril.', NULL),
  (v_user_id, v_tag_sup, 'DORSAIS | NO ESPALDAR C/ PEGADA PRONADA', 'Costas', 'Ficar em pé, encostado no espaldar, com as mãos em pronação um pouco afastadas além da largura dos ombros. Segurar a primeira barra logo acima da cabeça. Descer o corpo lentamente, estendendo os braços até a posição sentado no ar.', 'Na escápula: rombóides (feixes inferiores), trapézio feixes inferiores, peitoral menor. Na glenoumeral: grande dorsal, peitoral maior, deltoide posterior e redondo maior, tríceps porção longa.', 'Tal postura pode ser extremamente desafiadora para alguns indivíduos com encurtamentos severos dos dorsais.', 'https://www.youtube.com/watch?v=q2hV25CmDj0'),
  (v_user_id, v_tag_sup, 'DORSAIS | NO ESPALDAR C/ PEGADA SUPINADA', 'Costas', 'Ficar em pé, encostado no espaldar, com as mãos em supinação na largura dos ombros. Segurar a primeira barra logo acima da cabeça. Descer o corpo lentamente, estendendo os braços.', 'Na escápula: rombóides (feixes inferiores), trapézio feixes inferiores, peitoral menor. Na glenoumeral: grande dorsal, peitoral maior, deltoide posterior e redondo maior, tríceps porção longa, bíceps braquial porção longa.', 'Comparativamente à pegada pronada, existe um maior recrutamento do bíceps braquial.', NULL),
  (v_user_id, v_tag_sup, 'PEITORAIS | NO ESPALDAR', 'Peito', 'Ficar em pé de costas para o espaldar, apoiar as mãos em pronação no espaldar, numa barra abaixo da altura dos ombros e afastada além da largura dos ombros. Flexionar os joelhos lentamente até sentir o alongamento na parte anterior do tórax.', 'Peitoral maior (feixes inferiores), peitoral menor (feixes inferiores, indiretamente), deltoide anterior, coracobraquial, bíceps braquial (porção curta).', 'Observar a posição dos ombros, que devem estar estabilizados.', 'https://www.youtube.com/watch?v=t-LrX4-8Yf8'),
  (v_user_id, v_tag_sup, 'PEITORAIS | NA PAREDE', 'Peito', 'Ficar em pé de frente para uma parede, apoiar a palma da mão e o antebraço na parede, mantendo o cotovelo na altura do ombro. Rotar o tronco para o lado oposto até sentir o alongamento na parte anterior do tórax.', 'Peitoral maior (feixes médios), deltóide anterior, coracobraquial, bíceps braquial (porção curta), peitoral menor (leve).', 'Não permitir elevação do ombro durante a rotação.', NULL),
  (v_user_id, v_tag_sup, 'TRAPÉZIO | FIBRAS SUPERIORES', 'Costas', 'Sentar ou ficar em pé com o tronco ereto. Inclinar a cabeça lateralmente, aproximando a orelha do ombro, mantendo o ombro contralateral deprimido. Auxiliar com a mão sobre a cabeça.', 'Trapézio (fibras superiores), esternocleidomastoideo, escalenos, esplênio da cabeça.', 'Manter ombros deprimidos e estabilizados durante todo o movimento.', NULL),
  (v_user_id, v_tag_sup, 'TRAPÉZIO | FIBRAS MÉDIAS', 'Costas', 'Ficar em pé, cruzar os braços à frente do corpo segurando os cotovelos. Empurrar os braços para frente protraindo as escápulas até sentir o alongamento entre as escápulas.', 'Trapézio (fibras médias), romboides maior e menor.', 'Manter a coluna ereta, evitando flexão do tronco.', NULL),
  (v_user_id, v_tag_sup, 'DELTÓIDE POSTERIOR | EM PÉ', 'Ombro', 'Ficar em pé com tronco ereto. Levar um dos braços à frente do corpo, na altura do ombro, em direção ao ombro oposto. Com a mão contralateral, pressionar o cotovelo do braço alongado contra o peito.', 'Deltóide posterior, infraespinal, redondo menor, romboides.', 'Evitar rotação do tronco e elevação do ombro do lado alongado.', NULL);

  -- =============================================
  -- 3. EXERCÍCIOS (from Tiago)
  -- =============================================
  INSERT INTO exercicios (user_id, nome, descricao, grupos_musculares, link_video) VALUES
  (v_user_id, 'Supino reto com halteres', 'Supino reto com halteres, foco em peitoral e estabilização.', '{Peito,Tríceps,Ombro}', 'https://www.youtube.com/watch?v=z0VetLyN9xA'),
  (v_user_id, 'Supino inclinado', 'Press em banco inclinado com barra/halter.', '{Peito,Tríceps,Ombro}', 'https://www.youtube.com/watch?v=RGeSgQmO1EU'),
  (v_user_id, 'Supino declinado', 'Press em banco declinado.', '{Peito,Tríceps}', 'https://www.youtube.com/watch?v=J2g6qPBJfqo'),
  (v_user_id, 'Supino reto', 'Empurrar barra no banco reto.', '{Peito,Tríceps,Ombro}', 'https://www.youtube.com/watch?v=EZMYCLKuGow'),
  (v_user_id, 'Crucifixo reto', 'Abertura com halteres no banco reto.', '{Peito}', 'https://www.youtube.com/watch?v=uDMmccuPVPQ'),
  (v_user_id, 'Crossover', 'Abertura no cross (polia).', '{Peito}', 'https://www.youtube.com/watch?v=cKsqE_FodxI'),
  (v_user_id, 'Peck deck', 'Voador na máquina (peitoral).', '{Peito}', 'https://www.youtube.com/shorts/a9vQ_hwIksU'),
  (v_user_id, 'Supino reto na máquina', 'Máquina guiada para peitoral.', '{Peito,Tríceps}', 'https://www.youtube.com/watch?v=KlhflSA6624'),
  (v_user_id, 'Crucifixo reto máquina', 'Voador em máquina.', '{Peito}', 'https://www.youtube.com/watch?v=FzCnfD0gOXo'),
  (v_user_id, 'Supino inclinado crossover', 'Supino no cross.', '{Peito}', 'https://www.youtube.com/watch?v=FQcisp6sA1M'),
  (v_user_id, 'Supino inclinado smith', 'Supino inclinado em máquina smith.', '{Peito,Tríceps,Ombro}', 'https://www.youtube.com/watch?v=GjXIfditfnM'),
  (v_user_id, 'Flexão de braço', 'Push-up no solo.', '{Peito,Tríceps,Ombro}', 'https://www.youtube.com/watch?v=J7qIBHnHRmA'),
  (v_user_id, 'Pull-over', 'Extensão com halter no banco.', '{Peito,Costas}', 'https://www.youtube.com/watch?v=tN-QTbJt30Y'),
  (v_user_id, 'Puxada frente', 'Puxada na polia alta à frente.', '{Costas,Bíceps}', 'https://www.youtube.com/watch?v=hOCkiWXdEYg'),
  (v_user_id, 'Puxada alta pronada', 'Puxada na polia alta com pegada pronada e foco em dorsais.', '{Costas,Bíceps}', 'https://www.youtube.com/watch?v=KZyFUMEP--k'),
  (v_user_id, 'Remada unilateral', 'Remada com halter, braço alternado.', '{Costas,Bíceps}', 'https://www.youtube.com/watch?v=AmiHrGQfzkw'),
  (v_user_id, 'Remada curvada', 'Remada com barra, tronco inclinado.', '{Costas,Bíceps}', 'https://www.youtube.com/watch?v=vT2GjY_Umpw'),
  (v_user_id, 'Remada baixa', 'Remada sentada na polia baixa.', '{Costas,Bíceps}', 'https://www.youtube.com/watch?v=mUgFn3aMAP4'),
  (v_user_id, 'Remada sentada pronada', 'Pegada pronada na polia.', '{Costas,Bíceps}', 'https://www.youtube.com/watch?v=At-cbE0vUvI'),
  (v_user_id, 'Remada sentada triângulo', 'Pegada neutra triângulo.', '{Costas,Bíceps}', 'https://www.youtube.com/watch?v=-XLGXxuJpqw'),
  (v_user_id, 'Remada ascendente máquina', 'Remada em máquina convergente.', '{Costas}', 'https://www.youtube.com/watch?v=V-NEexFEEAg'),
  (v_user_id, 'Remada alta', 'Puxar barra até o queixo.', '{Ombro}', 'https://www.youtube.com/watch?v=ZOuBEpIIwBo'),
  (v_user_id, 'Barra fixa', 'Trações na barra (pull-up/chin-up).', '{Costas,Bíceps}', 'https://www.youtube.com/watch?v=BtdA0ojmo_g&vl=pt-BR'),
  (v_user_id, 'Retração escapular banco inclinado', 'Controle escapular no banco inclinado.', '{Costas}', 'https://www.youtube.com/watch?v=SB9Cq1NEdpc'),
  (v_user_id, 'Extensão lombar', 'Extensão do tronco no banco romano.', '{Costas}', 'https://www.youtube.com/watch?v=ph3pddpKzzw'),
  (v_user_id, 'Desenvolvimento militar', 'Press acima da cabeça.', '{Ombro,Tríceps}', 'https://www.youtube.com/watch?v=qbx391vUCt0'),
  (v_user_id, 'Desenvolvimento smith', 'Press na máquina smith.', '{Ombro,Tríceps}', 'https://www.youtube.com/watch?v=3ZwwrTtnGJo'),
  (v_user_id, 'Elevação lateral', 'Abdução dos braços com halteres.', '{Ombro}', 'https://www.youtube.com/watch?v=IwWvZ0rlNXs'),
  (v_user_id, 'Elevação lateral máquina', 'Elevação lateral guiada.', '{Ombro}', 'https://www.youtube.com/watch?v=2ZX0Nbv9UX0'),
  (v_user_id, 'Elevação lateral polia baixa', 'Elevação lateral na polia baixa.', '{Ombro}', 'https://www.youtube.com/watch?v=tdAfJkU45EU'),
  (v_user_id, 'Elevação frontal', 'Elevar halteres à frente.', '{Ombro}', 'https://www.youtube.com/watch?v=S7B5LwWrLA0'),
  (v_user_id, 'Crucifixo inverso', 'Abertura invertida (deltoide posterior).', '{Ombro,Costas}', 'https://www.youtube.com/watch?v=TBzGJrTjFA0'),
  (v_user_id, 'Crucifixo inverso polia', 'Deltoide posterior na polia.', '{Ombro,Costas}', 'https://www.youtube.com/watch?v=8zi3P49hx5g'),
  (v_user_id, 'Face pull', 'Puxada na face para deltoide posterior.', '{Ombro,Costas}', 'https://www.youtube.com/watch?v=xBmi3ZDWiHs'),
  (v_user_id, 'Rosca direta', 'Flexão de cotovelo com barra.', '{Bíceps}', 'https://www.youtube.com/watch?v=Q8TqfD8E7BU'),
  (v_user_id, 'Rosca alternada', 'Execução alternada com halteres.', '{Bíceps}', 'https://www.youtube.com/watch?v=TwD-YGVP4Bk'),
  (v_user_id, 'Rosca martelo', 'Pegada neutra (braquiorradial).', '{Bíceps}', 'https://www.youtube.com/watch?v=8B4kjxhbkDs'),
  (v_user_id, 'Rosca concentrada', 'Isolado com apoio na coxa.', '{Bíceps}', 'https://www.youtube.com/watch?v=KUy-PqrYfZA'),
  (v_user_id, 'Rosca Scott', 'Rosca no banco Scott para isolar o bíceps.', '{Bíceps}', 'https://www.youtube.com/watch?v=zpTK6eihdSA'),
  (v_user_id, 'Bíceps bayesian', 'Rosca na polia atrás do corpo, variação do bayesian curl.', '{Bíceps}', 'https://www.youtube.com/watch?v=Urrhqbe9Jd4'),
  (v_user_id, 'Tríceps corda', 'Extensão no pulley com corda.', '{Tríceps}', 'https://www.youtube.com/watch?v=L1vs6BrYnGI'),
  (v_user_id, 'Tríceps testa', 'Extensão deitado com barra/halter.', '{Tríceps}', 'https://www.youtube.com/watch?v=c9gJjQ9e2MQ'),
  (v_user_id, 'Triceps testa com halter', 'Extensão de tríceps deitado com halter.', '{Tríceps}', 'https://www.youtube.com/watch?v=4YiUjWQHV0k'),
  (v_user_id, 'Tríceps testa unilateral polia', 'Extensão unilateral na polia.', '{Tríceps}', 'https://www.youtube.com/watch?v=Jl7ZpLCgNVM'),
  (v_user_id, 'Kickback', 'Extensão atrás do tronco com halter.', '{Tríceps}', 'https://www.youtube.com/watch?v=6DSDuaIiz8M'),
  (v_user_id, 'Mergulho na paralela', 'Dips em barras paralelas.', '{Tríceps,Peito}', 'https://www.youtube.com/watch?v=6kALZikXxLc'),
  (v_user_id, 'Agachamento livre', 'Agachar com barra nas costas.', '{Perna,Glúteo}', 'https://www.youtube.com/watch?v=CaTbpJH49i4'),
  (v_user_id, 'Agachamento frontal', 'Agachar com barra à frente dos ombros.', '{Perna,Glúteo}', 'https://www.youtube.com/watch?v=ob6YjADoX3I'),
  (v_user_id, 'Agachamento sumô', 'Agachamento com base aberta e ponta dos pés levemente para fora.', '{Perna,Glúteo}', 'https://www.youtube.com/watch?v=u3_MRRyPwwk'),
  (v_user_id, 'Agachamento V squat', 'Máquina V squat.', '{Perna,Glúteo}', 'https://www.youtube.com/watch?v=6gTu6aSa-lQ'),
  (v_user_id, 'Leg press', 'Empurrar plataforma com as pernas.', '{Perna,Glúteo}', 'https://www.youtube.com/watch?v=nY8UsiAqwds'),
  (v_user_id, 'Leg press angular', 'Leg press inclinado.', '{Perna,Glúteo}', 'https://www.youtube.com/watch?v=xczGwAyCn74'),
  (v_user_id, 'Cadeira extensora', 'Extensão de joelho na máquina (controle total).', '{Perna}', 'https://www.youtube.com/watch?v=aEcEA0_WZC8'),
  (v_user_id, 'Cadeira flexora', 'Flexão de joelho focada em posterior.', '{Perna}', 'https://www.youtube.com/watch?v=AFG0wxXmTH4'),
  (v_user_id, 'Mesa flexora', 'Flexão de joelhos na mesa flexora, foco em posterior de coxa.', '{Perna}', 'https://www.youtube.com/watch?v=pA2dvttEkVk'),
  (v_user_id, 'Flexora em pé unilateral', 'Flexão de joelho em pé, unilateral.', '{Perna}', 'https://www.youtube.com/watch?v=aEcEA0_WZC8'),
  (v_user_id, 'Passada (lunge)', 'Avanço alternado com barra/halter.', '{Perna,Glúteo}', 'https://www.youtube.com/watch?v=QOVaHwm-Q6U'),
  (v_user_id, 'Afundo búlgaro', 'Unilateral com pé traseiro elevado.', '{Perna,Glúteo}', 'https://www.youtube.com/watch?v=2C-uNgKwPLE'),
  (v_user_id, 'Stiff', 'Flexão de quadril com barra.', '{Perna,Glúteo}', 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo'),
  (v_user_id, 'Levantamento terra', 'Deadlift tradicional com barra.', '{Perna,Costas,Glúteo}', 'https://www.youtube.com/watch?v=op9kVnSso6Q'),
  (v_user_id, 'Good morning', 'Inclinar tronco com barra nas costas.', '{Perna,Glúteo}', 'https://www.youtube.com/watch?v=vKPGe_8S3gM'),
  (v_user_id, 'Step-up no banco', 'Subida no banco com halteres.', '{Perna,Glúteo}', 'https://www.youtube.com/watch?v=QCmPI0b90hY'),
  (v_user_id, 'Elevação pélvica (hip thrust)', 'Hip thrust livre com foco em glúteo.', '{Glúteo,Perna}', 'https://www.youtube.com/watch?v=5KYtuo5Y-sg'),
  (v_user_id, 'Glúteo 4 apoios', 'Elevação de perna em quatro apoios.', '{Glúteo}', 'https://www.youtube.com/watch?v=lJqJvUXuVyc'),
  (v_user_id, 'Cadeira abdutora', 'Abertura de pernas na máquina.', '{Glúteo}', 'https://www.youtube.com/watch?v=ESHQCLn750E'),
  (v_user_id, 'Cadeira adutora', 'Fechamento de pernas.', '{Perna}', 'https://www.youtube.com/watch?v=ESHQCLn750E'),
  (v_user_id, 'Coice na polia', 'Glúteo na polia, coice com controle.', '{Glúteo}', 'https://www.youtube.com/watch?v=gMdEADKtMv4'),
  (v_user_id, 'Panturrilha em pé', 'Elevação de calcanhar em pé.', '{Perna}', 'https://www.youtube.com/watch?v=wzBaFpWx7MA'),
  (v_user_id, 'Panturrilha sentado', 'Elevação de calcanhar sentado.', '{Perna}', 'https://www.youtube.com/watch?v=wzBaFpWx7MA'),
  (v_user_id, 'Abdominal supra', 'Flexão de tronco no solo/banco.', '{Abdômen}', 'https://www.youtube.com/watch?v=1fbU_MkV7NE'),
  (v_user_id, 'Abdominal infra', 'Elevação de pernas/joelhos.', '{Abdômen}', 'https://www.youtube.com/watch?v=JB2oyawG9KI'),
  (v_user_id, 'Abdominal bicicleta', 'Alternar cotovelo-joelho.', '{Abdômen}', 'https://www.youtube.com/watch?v=oB6Hn_PaM9U'),
  (v_user_id, 'Abdominal oblíquo', 'Flexão lateral/rotação do tronco.', '{Abdômen}', 'https://www.youtube.com/watch?v=gozLqN8sC0k'),
  (v_user_id, 'Prancha frontal', 'Isometria apoiado nos antebraços.', '{Abdômen}', 'https://www.youtube.com/watch?v=DoOtkRaL1BI'),
  (v_user_id, 'Prancha lateral', 'Isometria apoiando lateralmente.', '{Abdômen}', 'https://www.youtube.com/watch?v=2NjO5KrlVEM'),
  (v_user_id, 'Abs curto polia alta', 'Crunch na polia alta.', '{Abdômen}', 'https://www.youtube.com/watch?v=KBSYCdO3_gs'),
  (v_user_id, 'Abs infra na paralela', 'Elevação de pernas na paralela.', '{Abdômen}', 'https://youtu.be/tCq1qnk-KZU'),
  (v_user_id, 'Remada Curvada', 'Foco em dorsais. Tronco inclinado ~45°.', '{Costas,Bíceps}', 'https://www.youtube.com/watch?v=jhFoLNInyvs');

  -- =============================================
  -- 4. TIPOS DE MICROCICLOS (from Tiago)
  -- =============================================
  INSERT INTO tipos_microciclos (user_id, nome, descricao) VALUES (v_user_id, 'Ordinária', 'Semana normal') RETURNING id INTO v_tm_ordinaria;
  INSERT INTO tipos_microciclos (user_id, nome, descricao) VALUES (v_user_id, 'Choque', 'Semana pesada') RETURNING id INTO v_tm_choque;
  INSERT INTO tipos_microciclos (user_id, nome, descricao) VALUES (v_user_id, 'Resistência', 'Semana de boa') RETURNING id INTO v_tm_resistencia;

  -- Ordinária config
  INSERT INTO tipos_microciclos_config (tipo_microciclo_id, tipo_serie, rep_min, rep_max, descanso_min, descanso_max) VALUES
  (v_tm_ordinaria, 'WARM-UP', 10, 15, 90, 120),
  (v_tm_ordinaria, 'FEEDER', 6, 10, 90, 150),
  (v_tm_ordinaria, 'WORK SET', 8, 12, 90, 180);

  -- Choque config
  INSERT INTO tipos_microciclos_config (tipo_microciclo_id, tipo_serie, rep_min, rep_max, descanso_min, descanso_max) VALUES
  (v_tm_choque, 'WARM-UP', 10, 15, 90, 120),
  (v_tm_choque, 'FEEDER', 6, 10, 90, 150),
  (v_tm_choque, 'WORK SET', 5, 8, 90, 240);

  -- Resistência config
  INSERT INTO tipos_microciclos_config (tipo_microciclo_id, tipo_serie, rep_min, rep_max, descanso_min, descanso_max) VALUES
  (v_tm_resistencia, 'WARM-UP', 10, 15, 90, 120),
  (v_tm_resistencia, 'FEEDER', 6, 10, 90, 120),
  (v_tm_resistencia, 'WORK SET', 10, 15, 90, 120);

  -- =============================================
  -- 5. PERIODIZAÇÃO "Ondulatória"
  -- =============================================
  INSERT INTO periodizacoes (user_id, nome) VALUES (v_user_id, 'Ondulatória') RETURNING id INTO v_perio_id;

  INSERT INTO periodizacoes_semanas (periodizacao_id, semana_num, tipo_microciclo_id, ordem) VALUES
  (v_perio_id, 1, v_tm_ordinaria, 1),
  (v_perio_id, 2, v_tm_ordinaria, 2),
  (v_perio_id, 3, v_tm_choque, 3),
  (v_perio_id, 4, v_tm_resistencia, 4);

  -- =============================================
  -- 6. ANAMNESE CAMPOS PADRÃO
  -- =============================================
  INSERT INTO anamnese_campos (user_id, label, tipo, obrigatorio, ordem) VALUES
  (v_user_id, 'CPF', 'text', false, 1),
  (v_user_id, 'Data de Nascimento', 'date', false, 2),
  (v_user_id, 'Endereço', 'text', false, 3),
  (v_user_id, 'Telefone/WhatsApp', 'text', false, 5),
  (v_user_id, 'Frequência semanal de treino', 'number', false, 6),
  (v_user_id, 'Dias disponíveis para treinar', 'text', false, 7),
  (v_user_id, 'Altura (cm)', 'number', false, 8),
  (v_user_id, 'Peso atual (kg)', 'number', false, 9),
  (v_user_id, '% Gordura', 'number', false, 10),
  (v_user_id, 'Profissão', 'text', false, 11),
  (v_user_id, 'Objetivo curto prazo', 'textarea', false, 13),
  (v_user_id, 'Objetivo longo prazo', 'textarea', false, 14),
  (v_user_id, 'Dificuldade para ganhar/perder peso', 'textarea', false, 15),
  (v_user_id, 'Pode fazer aeróbicos nos dias sem musculação?', 'boolean', false, 16),
  (v_user_id, 'Uso de substâncias de desempenho', 'textarea', false, 17),
  (v_user_id, 'Restrições, lesões e problemas de saúde', 'textarea', false, 18),
  (v_user_id, 'Exercícios que não pode fazer', 'textarea', false, 19),
  (v_user_id, 'Patologias (doenças)', 'textarea', false, 20),
  (v_user_id, 'Medicamentos em uso', 'textarea', false, 21),
  (v_user_id, 'Uso de drogas recreativas', 'textarea', false, 22),
  (v_user_id, 'Dificuldades com treinamento', 'textarea', false, 23),
  (v_user_id, 'Horários para refeições', 'text', false, 24),
  (v_user_id, 'Preferências de treino', 'textarea', false, 25),
  (v_user_id, 'Preparação para TAF', 'textarea', false, 26),
  (v_user_id, 'Dieta atual', 'textarea', false, 27),
  (v_user_id, 'Observações adicionais', 'textarea', false, 28);

  -- Campos com opções (select)
  INSERT INTO anamnese_campos (user_id, label, tipo, obrigatorio, ordem, opcoes) VALUES
  (v_user_id, 'Como conheceu o personal', 'select', false, 4, '["Instagram","Facebook","TikTok","YouTube","Indicação","Outro"]'::jsonb),
  (v_user_id, 'Rotina diária (gasto calórico)', 'select', false, 12, '["Sedentário","Moderado","Ativo","Trabalho braçal"]'::jsonb);

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for new user insertion
CREATE TRIGGER on_new_personal_seed
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_new_personal();
