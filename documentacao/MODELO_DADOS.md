# MODELO_DADOS.md

Este documento detalha o esquema do banco de dados relacional para o sistema SRGO v1.0. O SGBD de referência é o PostgreSQL.

---

### Tabela: `OrganizacaoCriminosa`
Armazena a lista de organizações criminosas gerenciada pelo administrador.

| Nome da Coluna | Tipo de Dado | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id_orcrim` | SERIAL | PRIMARY KEY | Identificador único da ORCRIM. |
| `nome_organizacao`| VARCHAR(255) | NOT NULL, UNIQUE | Nome completo da organização. |
| `status` | VARCHAR(10) | NOT NULL, DEFAULT 'Ativo' | Status da ORCRIM (Ativo/Inativo). |

---

### Tabela: `Ocorrencia`
Tabela central que armazena os dados gerais de cada evento registrado.

| Nome da Coluna | Tipo de Dado | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id_ocorrencia` | SERIAL | PRIMARY KEY | Identificador único da ocorrência. |
| `tipo_ocorrencia`| VARCHAR(50) | NOT NULL | Tipo do evento (Homicidio, Resistencia, etc.). |
| `data_fato` | TIMESTAMP | NOT NULL | Data e hora exatas do fato. |
| `descricao_fato` | TEXT | NOT NULL | Narrativa completa da ocorrência. |
| `evolucao_ocorrencia`| TEXT | NULL | Campo para atualizações futuras sobre o caso. |
| `endereco_localizacao`| VARCHAR(255) | NULL | Endereço ou ponto de referência do fato. |
| `regiao` | VARCHAR(50) | NULL | Região administrativa (Capital, RMS, Interior). |
| `fonte_informacao`| VARCHAR(255) | NULL | Fonte da notícia (Ex: 10ª CIPM, Informe Baiano). |
| `caderno_informativo`| VARCHAR(50) | NOT NULL | Caderno do PDF onde a ocorrência será publicada. |
| `id_usuario_registro`| INTEGER | FOREIGN KEY (users.id) | ID do usuário que efetuou o registro. |
| `data_criacao` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Data e hora do registro no sistema. |

---

### Tabela: `PessoaEnvolvida`
Registra cada indivíduo (vítima, autor, resistente, etc.) ligado a uma ocorrência.

| Nome da Coluna | Tipo de Dado | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id_pessoa` | SERIAL | PRIMARY KEY | Identificador único da pessoa. |
| `id_ocorrencia` | INTEGER | FOREIGN KEY (Ocorrencia.id) | Chave estrangeira que liga à ocorrência. |
| `nome_completo` | VARCHAR(255) | NOT NULL | Nome completo do indivíduo. |
| `vulgo` | VARCHAR(100) | NULL | Vulgo ou alcunha. |
| `data_nascimento` | DATE | NULL | Data de nascimento. |
| `filiacao` | VARCHAR(255) | NULL | Nome do pai e da mãe. |
| `documento_cpf` | VARCHAR(11) | NULL, UNIQUE | CPF do indivíduo, se disponível. |
| `tipo_envolvimento`| VARCHAR(50) | NOT NULL | Papel da pessoa na ocorrência (Vítima, Resistente...).|
| `situacao_lesao`| VARCHAR(50) | NULL | Tipo de lesão sofrida (Fatal (AF), Ferido, etc.). |
| `antecedentes_resumo`| TEXT | NULL | Breve resumo dos antecedentes criminais. |
| `caminho_foto` | VARCHAR(255) | NULL | Caminho para o arquivo de imagem da pessoa. |

---

### Tabela: `VinculoOrcrim`
Tabela de ligação que associa uma `PessoaEnvolvida` a uma `OrganizacaoCriminosa`.

| Nome da Coluna | Tipo de Dado | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id_vinculo` | SERIAL | PRIMARY KEY | Identificador único do vínculo. |
| `id_pessoa` | INTEGER | FOREIGN KEY (PessoaEnvolvida.id)| Chave estrangeira que liga à pessoa. |
| `id_orcrim` | INTEGER | FOREIGN KEY (OrganizacaoCriminosa.id)| Chave estrangeira que liga à ORCRIM. |

---

### Tabela: `ProcedimentoPenal`
Registra os procedimentos penais (inquéritos, ações) associados a uma `PessoaEnvolvida`.

| Nome da Coluna | Tipo de Dado | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id_procedimento` | SERIAL | PRIMARY KEY | Identificador único do procedimento. |
| `id_pessoa` | INTEGER | FOREIGN KEY (PessoaEnvolvida.id)| Chave estrangeira que liga à pessoa. |
| `numero_procedimento`| VARCHAR(100) | NOT NULL | Número do inquérito ou ação penal. |
| `natureza_procedimento`| VARCHAR(100) | NULL | Natureza do procedimento (Ex: Inquérito Policial). |
| `unidade_origem`| VARCHAR(255) | NULL | Delegacia ou Vara de origem. |