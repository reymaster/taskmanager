# TaskManager - Instruções de Uso

## Visão Geral
TaskManager é uma ferramenta de linha de comando (CLI) desenvolvida para auxiliar desenvolvedores no gerenciamento de tarefas de desenvolvimento. A ferramenta oferece uma interface intuitiva e recursos avançados para organização e acompanhamento de tarefas.

## Requisitos
- Node.js versão 16.0.0 ou superior
- NPM ou Yarn para gerenciamento de dependências

## Instalação
```bash
# Instalação global
npm install -g taskmanager

# Ou instalação local
npm install taskmanager
```

## Comandos Disponíveis

### Inicialização
```bash
taskmanager init
```
Inicializa o TaskManager no projeto atual. Cria a estrutura necessária de arquivos e configurações.

### Criação de Tarefas
```bash
taskmanager create
```
Cria uma nova tarefa. Opções disponíveis:
- `-y, --yes`: Pula confirmações e usa valores padrão
- `-a, --ai`: Usa IA para gerar tarefas automaticamente
- `-t, --title`: Define o título da tarefa
- `-d, --description`: Define a descrição da tarefa
- `-p, --priority`: Define a prioridade (high, medium, low)

### Expansão de Tarefas
```bash
taskmanager expand <id>
```
Expande uma tarefa em subtarefas menores. Opções:
- `--num`: Número de subtarefas a serem criadas
- `--ai`: Força o uso de IA para análise
- `--no-ai`: Desativa o uso de IA

### Listagem de Tarefas
```bash
taskmanager list
```
Lista todas as tarefas do projeto.

### Próxima Tarefa
```bash
taskmanager next
```
Mostra a próxima tarefa a ser trabalhada.

### Atualização de Status
```bash
taskmanager status <id>
```
Atualiza o status de uma tarefa específica. Opções:
- `--done`: Marca como concluída
- `--pending`: Marca como pendente
- `--in-progress`: Marca como em andamento

## Estrutura do Projeto
- `/commands`: Contém os comandos principais da CLI
- `/utils`: Utilitários e funções auxiliares
- `/templates`: Templates para geração de tarefas
- `/docs`: Documentação do projeto

## Configuração
O TaskManager pode ser configurado através de variáveis de ambiente ou arquivo de configuração. As principais configurações incluem:
- Caminho do diretório de tarefas
- Configurações de IA
- Preferências de exibição

## Suporte
Para suporte ou reportar problemas, por favor abra uma issue no repositório do projeto.

## Contribuição
Contribuições são bem-vindas! Por favor, leia as diretrizes de contribuição antes de enviar pull requests.

## Geração de Instruções para Agentes de IA e Editores

O TaskManager é capaz de compilar automaticamente todas as regras e diretrizes da pasta `templates/editor/rules/cursor` em um único arquivo Markdown para uso por agentes de IA (como GitHub Copilot, Claude, Gemini, etc) ou editores inteligentes.

### Como funciona
- Durante a inicialização (`taskmanager init`), o sistema gera o arquivo `.github/copilot-instructions.md` contendo todas as regras compiladas para o Copilot.
- O processo é flexível: basta alterar o destino e o nome do arquivo para gerar instruções para outros agentes ou editores (ex: `.vscode/copilot-instructions.md`, `.cursor/claude-instructions.md`, etc).

### Como adicionar instruções para outros agentes/editores
1. No código, utilize a função utilitária:
   ```js
   await generateAgentInstructions('nome-do-agente', 'pasta-de-destino');
   ```
   - Exemplo para Gemini no VSCode:
     ```js
     await generateAgentInstructions('gemini', '.vscode');
     ```
   - Exemplo para Claude no Cursor:
     ```js
     await generateAgentInstructions('claude', '.cursor');
     ```
2. O nome do arquivo gerado será, por padrão, `nome-do-agente-instructions.md` (ex: `copilot-instructions.md`).
3. O conteúdo será sempre a compilação de todos os arquivos `.mdc` presentes em `templates/editor/rules/cursor`.

### Observações
- Não há dependência fixa da pasta `.github`. O destino pode ser qualquer pasta de configuração do projeto.
- Para adicionar regras específicas para um agente/editor, basta criar um novo arquivo `.mdc` em `templates/editor/rules/cursor`.
- O processo pode ser chamado manualmente ou automatizado em outros comandos/scripts conforme a necessidade do projeto.
