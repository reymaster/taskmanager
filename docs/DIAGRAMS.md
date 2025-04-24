# TaskManager - Diagramas e Fluxos

## Diagrama de Arquitetura

```mermaid
graph TD
    A[CLI Interface] --> B[Comandos]
    B --> C[init]
    B --> D[create]
    B --> E[expand]
    B --> F[list]
    B --> G[next]
    B --> H[status]

    C --> I[Utils]
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I

    I --> J[Templates]
    I --> K[Configurações]
```

## Fluxo de Execução

### Fluxo de Inicialização
```mermaid
sequenceDiagram
    participant U as Usuário
    participant C as CLI
    participant I as Init Command
    participant F as File System

    U->>C: taskmanager init
    C->>I: execute()
    I->>F: verifica estrutura
    F-->>I: retorna status
    I->>F: cria arquivos necessários
    I-->>C: confirmação
    C-->>U: sucesso/erro
```

### Fluxo de Criação de Tarefa
```mermaid
sequenceDiagram
    participant U as Usuário
    participant C as CLI
    participant CR as Create Command
    participant AI as IA Service
    participant F as File System

    U->>C: taskmanager create
    C->>CR: execute()
    alt Com IA
        CR->>AI: gera tarefa
        AI-->>CR: retorna tarefa
    else Sem IA
        CR->>U: solicita dados
        U-->>CR: fornece dados
    end
    CR->>F: salva tarefa
    F-->>CR: confirmação
    CR-->>C: sucesso
    C-->>U: confirmação
```

## Estrutura de Dados

### Tarefa
```json
{
    "id": "string",
    "title": "string",
    "description": "string",
    "priority": "high|medium|low",
    "status": "pending|in-progress|done",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "subtasks": ["array of task ids"],
    "parent_task": "task id or null"
}
```

## Relações entre Componentes

1. **CLI Interface**
   - Gerencia a interação com o usuário
   - Roteia comandos para os respectivos handlers
   - Formata a saída para o terminal

2. **Comandos**
   - Implementam a lógica específica de cada comando
   - Utilizam serviços utilitários
   - Interagem com o sistema de arquivos

3. **Utils**
   - Fornecem funcionalidades compartilhadas
   - Gerenciam configurações
   - Implementam lógica de negócio comum

4. **Templates**
   - Armazenam modelos para geração de tarefas
   - Definem estruturas padrão
   - Facilitam a criação consistente de tarefas

## Fluxo de Dados

1. **Entrada**
   - Comandos do usuário via terminal
   - Arquivos de configuração
   - Templates

2. **Processamento**
   - Validação de entrada
   - Geração de conteúdo (opcionalmente com IA)
   - Manipulação de dados

3. **Saída**
   - Arquivos de tarefas
   - Feedback no terminal
   - Logs de operação
