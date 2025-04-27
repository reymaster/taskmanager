# Instruções para o agente copilot


---
## commands.mdc

---
description: Command guide for using Task Master to manage task-driven development workflows
globs: **/*
alwaysApply: true
---

# Guia Completo de Comandos do TaskManager CLI

## Inicialização

### `taskmanager init`
Inicializa o TaskManager no diretório atual.
```
Opções:
  -y, --yes     Pula confirmações e usa valores padrão
```

## Gerenciamento de Tarefas

### `taskmanager create`
Cria novas tarefas para o projeto.
```
Opções:
  -y, --yes                           Pula confirmações e usa valores padrão
  -a, --ai                            Usa IA para gerar tarefas automaticamente
  -t, --title <title>                 Título da tarefa (para criação manual)
  -d, --description <description>     Descrição da tarefa (para criação manual)
  -p, --priority <priority>           Prioridade da tarefa (high, medium, low)
  --reset                             Recria as tarefas básicas do projeto, fazendo backup das atuais
  --restore                           Lista e permite restaurar backups anteriores das tarefas
```

### `taskmanager list`
Lista todas as tarefas do projeto.
```
Opções:
  --show-subtasks                     Mostra as subtarefas de cada tarefa
  --status <status>                   Filtra por status (pending, in-progress, done, cancelled)
  --priority <priority>               Filtra por prioridade (high, medium, low)
```

### `taskmanager show <id>`
Mostra detalhes completos de uma tarefa específica.

### `taskmanager next`
Mostra a próxima tarefa a ser implementada.

### `taskmanager current`
Mostra a tarefa atualmente em desenvolvimento.

### `taskmanager set status <id>`
Atualiza o status de uma tarefa ou subtarefa.

## Expansão e Análise

### `taskmanager expand <id>`
Expande uma tarefa em subtarefas mais detalhadas.
```
Opções:
  --num <number>      Número de subtarefas a serem criadas (padrão: 3)
  --ai                Força o uso de IA para análise avançada
  --no-ai             Desativa o uso de IA para análise
```

### `taskmanager parse`
Gera arquivos PRD para cada tarefa.

## Exemplos de Uso

### Inicialização de projeto
```bash
taskmanager init
```

### Criação de tarefas
```bash
# Criar tarefa interativamente
taskmanager create

# Gerar tarefas usando IA
taskmanager create --ai

# Criar tarefa com título específico
taskmanager create -t "Implementar autenticação"
```

### Visualização de tarefas
```bash
# Listar todas as tarefas
taskmanager list

# Listar tarefas com subtarefas
taskmanager list --show-subtasks

# Listar tarefas por status
taskmanager list --status in-progress

# Ver detalhes de uma tarefa
taskmanager show 1
```

### Gerenciamento de workflow
```bash
# Ver próxima tarefa disponível
taskmanager next

# Ver tarefa atual
taskmanager current

# Atualizar status de uma tarefa
taskmanager set status 1
```

### Expansão e análise
```bash
# Expandir tarefa em subtarefas com IA
taskmanager expand 1 --ai

# Expandir tarefa em 5 subtarefas
taskmanager expand 1 --num=5

# Gerar PRDs para documentação
taskmanager parse
```

### Restauração e reset
```bash
# Restaurar backup de tarefas
taskmanager create --restore

# Resetar e recriar tarefas básicas
taskmanager create --reset
```

## Dicas Rápidas

- Use `taskmanager next` para identificar a próxima tarefa disponível para trabalho
- Use `taskmanager expand --ai` para análise avançada de complexidade e subdivisão inteligente
- Configure suas chaves de API no arquivo `.taskmanager/.env` para maximizar os recursos de IA
- Use `taskmanager set status` para atualizar rapidamente o progresso de tarefas
- Verifique regularmente `taskmanager current` para manter o foco na tarefa atual
Este guia cobre todos os comandos disponíveis no TaskManager CLI, suas opções e exemplos de uso para facilitar o gerenciamento de tarefas no seu projeto.

---
## cursor-rules.mdc

---
description: Guidelines for creating and maintaining Cursor rules to ensure consistency and effectiveness.
globs: .cursor/rules/*.mdc
alwaysApply: true
---

- **Required Rule Structure:**
  ```markdown
  ---
  description: Clear, one-line description of what the rule enforces
  globs: path/to/files/*.ext, other/path/**/*
  alwaysApply: boolean
  ---

  - **Main Points in Bold**
    - Sub-points with details
    - Examples and explanations
  ```

- **Mantain the context**
- Use global CLI `taskmanager` to mantain focus on the context.
- Always execute `taskmanager list --show-subtasks` to know about the list of tasks.
- Always execute `taskmanager show [id]` to know details about a task.
- Always execute `taskmanager current` to know about the task in execution.
- Always execute `taskmanager next` if you want to know which the task will be implemented next.
- Always execute `taskmanager set status [ID] pending|progress|done|cancelled|postponed` to change task status.

- **File References:**
  - Use `[filename](mdc:path/to/file)` ([filename](mdc:filename)) to reference files
  - Example: [prisma.mdc](mdc:.cursor/rules/prisma.mdc) for rule references
  - Example: [schema.prisma](mdc:prisma/schema.prisma) for code references

- **Code Examples:**
  - Use language-specific code blocks
  ```typescript
  // ✅ DO: Show good examples
  const goodExample = true;

  // ❌ DON'T: Show anti-patterns
  const badExample = false;
  ```

- **Rule Content Guidelines:**
  - Start with high-level overview
  - Include specific, actionable requirements
  - Show examples of correct implementation
  - Reference existing code when possible
  - Keep rules DRY by referencing other rules

- **Rule Maintenance:**
  - Update rules when new patterns emerge
  - Add examples from actual codebase
  - Remove outdated patterns
  - Cross-reference related rules
- **Best Practices:**
  - Use bullet points for clarity
  - Keep descriptions concise
  - Include both DO and DON'T examples
  - Reference actual code over theoretical examples
  - Use consistent formatting across rules

---
## dependencies.mdc

---
description: Diretrizes para gerenciar dependências e relacionamentos entre tarefas no TaskManager
globs: utils/tasks.js
alwaysApply: false
---

# Diretrizes de Gerenciamento de Dependências no TaskManager

## Princípios de Estrutura de Dependências

- **Referências de Dependências**:
  - ✅ FAÇA: Represente dependências de tarefas como arrays de IDs
  - ✅ FAÇA: Use IDs numéricos para referências diretas entre tarefas
  - ✅ FAÇA: Use IDs em formato string com notação de ponto (ex: "1.2") para referências a subtarefas
  - ❌ NÃO FAÇA: Misture tipos de referência sem conversão adequada

  ```javascript
  // ✅ FAÇA: Use formatos de dependência consistentes
  // Para tarefas principais
  task.dependencies = [1, 2, 3]; // Dependências de outras tarefas principais

  // Para subtarefas
  subtask.dependencies = [1, "3.2"]; // Dependência da tarefa principal 1 e subtarefa 2 da tarefa 3
  ```

- **Dependências de Subtarefas**:
  - ✅ FAÇA: Permita que IDs numéricos de subtarefas referenciem outras subtarefas dentro do mesmo pai
  - ✅ FAÇA: Converta entre formatos adequadamente quando necessário
  - ❌ NÃO FAÇA: Crie dependências circulares entre subtarefas

  ```javascript
  // ✅ FAÇA: Normalize adequadamente as dependências de subtarefas
  // Quando uma subtarefa se refere a outra subtarefa no mesmo pai
  if (typeof depId === 'number' && depId < 100) {
    // Provavelmente é uma referência a outra subtarefa na mesma tarefa pai
    const fullSubtaskId = `${parentId}.${depId}`;
    // Agora use fullSubtaskId para validação
  }
  ```

## Validação de Dependências

- **Verificação de Existência**:
  - ✅ FAÇA: Valide que as tarefas referenciadas existem antes de adicionar dependências
  - ✅ FAÇA: Forneça mensagens de erro claras para dependências inexistentes
  - ✅ FAÇA: Remova referências a tarefas inexistentes durante a validação

  ```javascript
  // ✅ FAÇA: Verifique se a dependência existe antes de adicionar
  const taskIndex = tasksData.tasks.findIndex(t => t.id === parseInt(dependsOnId));
  if (taskIndex === -1) {
    console.log(formatError(`Dependência #${dependsOnId} não encontrada.`));
    return false;
  }
  ```

- **Prevenção de Dependências Circulares**:
  - ✅ FAÇA: Verifique dependências circulares antes de adicionar novos relacionamentos
  - ✅ FAÇA: Use algoritmos de travessia de grafo (DFS) para detectar ciclos
  - ✅ FAÇA: Forneça mensagens de erro claras explicando a cadeia circular

  ```javascript
  // ✅ FAÇA: Verifique dependências circulares
  function hasCycle(taskId, visited = new Set(), recursionStack = new Set()) {
    visited.add(taskId);
    recursionStack.add(taskId);

    const task = tasksData.tasks.find(t => t.id === taskId);
    if (task && task.dependencies) {
      for (const depId of task.dependencies) {
        if (!visited.has(depId)) {
          if (hasCycle(depId, visited, recursionStack)) {
            return true;
          }
        } else if (recursionStack.has(depId)) {
          return true;
        }
      }
    }

    recursionStack.delete(taskId);
    return false;
  }
  ```

- **Prevenção de Auto-Dependência**:
  - ✅ FAÇA: Evite que tarefas dependam de si mesmas
  - ✅ FAÇA: Trate auto-dependências diretas e indiretas

  ```javascript
  // ✅ FAÇA: Evite auto-dependências
  if (taskId === dependsOnId) {
    console.log(formatError(`Tarefa #${taskId} não pode depender de si mesma.`));
    return false;
  }
  ```

## Modificação de Dependências

- **Adicionando Dependências**:
  - ✅ FAÇA: Formate IDs de tarefas e dependências consistentemente
  - ✅ FAÇA: Verifique dependências existentes para evitar duplicatas
  - ✅ FAÇA: Ordene dependências para melhor legibilidade

  ```javascript
  // ✅ FAÇA: Formate IDs consistentemente ao adicionar dependências
  export async function addDependency(taskId, dependsOnId) {
    const tasksData = await loadTasks();

    // Formate os IDs para garantir consistência
    const formattedTaskId = parseInt(taskId, 10);
    const formattedDepId = parseInt(dependsOnId, 10);

    // Verifique se a tarefa já tem esta dependência
    const task = tasksData.tasks.find(t => t.id === formattedTaskId);
    if (task.dependencies.includes(formattedDepId)) {
      console.log(formatInfo(`Tarefa #${taskId} já depende de #${dependsOnId}.`));
      return true;
    }

    // Adicione a dependência e ordene
    task.dependencies.push(formattedDepId);
    task.dependencies.sort((a, b) => a - b);

    await saveTasks(tasksData);
    return true;
  }
  ```

- **Removendo Dependências**:
  - ✅ FAÇA: Verifique se a dependência existe antes de remover
  - ✅ FAÇA: Trate diferentes formatos de ID consistentemente
  - ✅ FAÇA: Forneça feedback sobre o resultado da remoção

  ```javascript
  // ✅ FAÇA: Trate corretamente a remoção de dependências
  export async function removeDependency(taskId, dependsOnId) {
    const tasksData = await loadTasks();

    // Formate os IDs
    const formattedTaskId = parseInt(taskId, 10);
    const formattedDepId = parseInt(dependsOnId, 10);

    // Encontre a tarefa
    const task = tasksData.tasks.find(t => t.id === formattedTaskId);
    if (!task) {
      console.log(formatError(`Tarefa #${taskId} não encontrada.`));
      return false;
    }

    // Verifique se a dependência existe
    const depIndex = task.dependencies.indexOf(formattedDepId);
    if (depIndex === -1) {
      console.log(formatInfo(`Tarefa #${taskId} não depende de #${dependsOnId}.`));
      return false;
    }

    // Remova a dependência
    task.dependencies.splice(depIndex, 1);
    await saveTasks(tasksData);

    console.log(formatSuccess(`Dependência #${dependsOnId} removida de #${taskId}.`));
    return true;
  }
  ```

## Limpeza de Dependências

- **Remoção de Duplicatas**:
  - ✅ FAÇA: Use objetos Set para identificar e remover duplicatas
  - ✅ FAÇA: Trate formatos de ID numéricos e string

  ```javascript
  // ✅ FAÇA: Remova dependências duplicadas
  export function validateAndAdjustDependencies(tasks) {
    for (const task of tasks) {
      if (!task.dependencies) continue;

      // Use Set para remover duplicatas
      const uniqueDeps = new Set();
      task.dependencies = task.dependencies.filter(depId => {
        const depIdStr = String(depId);
        if (uniqueDeps.has(depIdStr)) {
          return false;
        }
        uniqueDeps.add(depIdStr);
        return true;
      });
    }

    return tasks;
  }
  ```

- **Limpeza de Referências Inválidas**:
  - ✅ FAÇA: Verifique e remova referências a tarefas inexistentes
  - ✅ FAÇA: Verifique e remova auto-referências
  - ✅ FAÇA: Acompanhe e relate mudanças feitas durante a limpeza

  ```javascript
  // ✅ FAÇA: Filtre dependências de tarefas inválidas
  export async function cleanupDependencies() {
    const tasksData = await loadTasks();
    let changesMade = 0;

    // Crie um conjunto de IDs válidos
    const validTaskIds = new Set(tasksData.tasks.map(t => t.id));

    for (const task of tasksData.tasks) {
      if (!task.dependencies) continue;

      const originalLength = task.dependencies.length;
      task.dependencies = task.dependencies.filter(depId => {
        // Remova dependências para tarefas inexistentes
        if (!validTaskIds.has(depId)) {
          return false;
        }
        // Remova auto-dependências
        if (depId === task.id) {
          return false;
        }
        return true;
      });

      changesMade += (originalLength - task.dependencies.length);
    }

    if (changesMade > 0) {
      await saveTasks(tasksData);
      console.log(formatSuccess(`${changesMade} dependências inválidas removidas.`));
    } else {
      console.log(formatInfo('Nenhuma dependência inválida encontrada.'));
    }

    return changesMade;
  }
  ```

## Visualização de Dependências

- **Indicadores de Status**:
  - ✅ FAÇA: Use indicadores visuais para mostrar status de dependência (✅/⏱️)
  - ✅ FAÇA: Formate listas de dependências consistentemente

  ```javascript
  // ✅ FAÇA: Formate dependências com indicadores de status
  export function formatDependency(depId, allTasks) {
    const depTask = allTasks.find(t => t.id === depId);

    if (!depTask) {
      return chalk.red(`#${depId} (não encontrada)`);
    }

    const icon = depTask.status === 'done' || depTask.status === 'completed'
      ? chalk.green('✅')
      : chalk.yellow('⏱️');

    return `${icon} #${depId} - ${depTask.title}`;
  }
  ```

## Detecção de Ciclos

- **Travessia de Grafo**:
  - ✅ FAÇA: Use busca em profundidade (DFS) para detecção de ciclos
  - ✅ FAÇA: Acompanhe nós visitados e pilha de recursão
  - ✅ FAÇA: Suporte dependências tanto de tarefas quanto de subtarefas

  ```javascript
  // ✅ FAÇA: Use algoritmos adequados de detecção de ciclos
  export function detectCycles(tasks) {
    const cycles = [];
    const visited = new Set();

    function dfs(taskId, path = []) {
      visited.add(taskId);
      path.push(taskId);

      const task = tasks.find(t => t.id === taskId);
      if (task && task.dependencies) {
        for (const depId of task.dependencies) {
          const index = path.indexOf(depId);
          if (index !== -1) {
            // Ciclo encontrado
            cycles.push(path.slice(index).concat(depId));
          } else if (!visited.has(depId)) {
            dfs(depId, [...path]);
          }
        }
      }
    }

    for (const task of tasks) {
      if (!visited.has(task.id)) {
        dfs(task.id);
      }
    }

    return cycles;
  }
  ```

Consulte `utils/tasks.js` para exemplos de implementação e integração com o sistema do TaskManager para gerenciamento eficiente de dependências de tarefas.

---
## dev-workflow.mdc

---
description: Guide for using Task Master to manage task-driven development workflows
globs: **/*
alwaysApply: true
---

# Regras de Desenvolvimento com TaskManager

## 1. Princípios Gerais

- Todo desenvolvimento deve ser orientado por tarefas
- Todas as tarefas devem ser registradas no TaskManager antes da implementação
- Respeite sempre as dependências entre tarefas
- Documente adequadamente cada tarefa concluída

## 2. Fluxo de Trabalho Diário

1. Verificar tarefas atuais: `taskmanager current`
2. Verificar próxima tarefa disponível: `taskmanager next`
3. Iniciar trabalho em uma tarefa: `taskmanager set status <id> --in-progress`
4. Ao concluir, atualizar status: `taskmanager set status <id> --done`

## 3. Estruturação de Tarefas

- Tarefas complexas devem ser expandidas em subtarefas: `taskmanager expand <id>`
- Use a opção `--ai` para análise inteligente: `taskmanager expand <id> --ai`
- Mantenha tarefas pequenas e focadas (máximo 1 dia de trabalho)
- Cada tarefa deve ter uma estratégia de teste definida

## 4. Integração com IA

- Configure suas chaves de API no arquivo `.taskmanager/.env`
- Para geração automática de tarefas: `taskmanager create --ai`
- Para análise de complexidade: `taskmanager expand <id> --ai`
- Defina o modelo preferido (OpenAI, Anthropic, Hugging Face) na configuração

## 5. Priorização e Dependências

- Respeite a prioridade das tarefas (alta, média, baixa)
- Não inicie uma tarefa com dependências pendentes
- Use `taskmanager next` para identificar a próxima tarefa disponível
- Verifique todas as dependências com `taskmanager show <id>`

## 6. Documentação

- Cada tarefa deve ter uma descrição clara e detalhada
- Adicione detalhes técnicos em "Detalhes de Implementação"
- Defina estratégias de teste específicas para cada tarefa
- Use `taskmanager parse` para gerar documentação estruturada

## 7. Organização do Projeto

- Use o comando `taskmanager init` para inicializar um novo projeto
- Mantenha arquivos relacionados à TaskManager no diretório `.taskmanager`
- Backup de tarefas é feito automaticamente antes de operações críticas
- Restaure backups quando necessário: `taskmanager create --restore`

## 8. Revisão e Análise

- Verifique o progresso geral do projeto com `taskmanager list`
- Use as estatísticas para avaliar a velocidade de desenvolvimento
- Avalie regularmente a complexidade das tarefas para melhor planejamento
- Documente lições aprendidas ao concluir tarefas complexas

## 9. Responsabilidades da Equipe

- Todo membro deve atualizar o status de suas tarefas diariamente
- Comunique bloqueios ou impedimentos imediatamente
- Ao concluir uma tarefa, identifique a próxima de acordo com as dependências
- Evite modificar tarefas atribuídas a outros membros da equipe

## 10. Boas Práticas

- Nunca pule o fluxo de trabalho baseado em tarefas
- Mantenha a consistência nos títulos e descrições das tarefas
- Atualize as estimativas de complexidade conforme o aprendizado
- Use categorias para agrupar tarefas relacionadas
- Registre insights técnicos importantes nos detalhes das tarefas

Acompanhe o arquivo [commands.mdc](mdc:.cursor/rules/commands.mdc) para ter um guia completo dos comandos da CLI.
Acompanhe o arquivo [dependencies.mdc](mdc:.cursor/rules/dependencies.mdc) para conhecer como lidar com dependencias no CLI.

Este documento serve como guia para utilização eficiente do TaskManager em projetos de desenvolvimento, garantindo consistência, rastreabilidade e melhor gestão do trabalho.

---
## paths.mdc

# Caminhos do Projeto

## Estrutura Base
- Raiz do projeto: `/home/reinaldonascimento/Development/Projetos/Testes/docker-manager`
- Frontend: `/home/reinaldonascimento/Development/Projetos/Testes/docker-manager/frontend`
- Backend: `/home/reinaldonascimento/Development/Projetos/Testes/docker-manager/backend`

## Regras de Localização

### Frontend
- Todos os arquivos e configurações do frontend DEVEM estar em `/frontend`
- Arquivos de configuração como `package.json`, `vite.config.ts`, `postcss.config.js`, `tailwind.config.js` devem estar em `/frontend`
- Instalação de dependências DEVE ser feita dentro de `/frontend`
- Comandos de desenvolvimento (npm run dev, etc) DEVEM ser executados dentro de `/frontend`

### Backend
- Todos os arquivos e configurações do backend DEVEM estar em `/backend`
- Arquivos de configuração como `package.json`, `.env`, etc devem estar em `/backend`
- Instalação de dependências DEVE ser feita dentro de `/backend`
- Comandos de desenvolvimento DEVEM ser executados dentro de `/backend`

## Exemplos de Uso

### Frontend
```bash
# Correto
cd /home/reinaldonascimento/Development/Projetos/Testes/docker-manager/frontend
npm install
npm run dev

# Incorreto
cd /home/reinaldonascimento/Development/Projetos/Testes/docker-manager
npm install # Não instalar na raiz!
```

### Backend
```bash
# Correto
cd /home/reinaldonascimento/Development/Projetos/Testes/docker-manager/backend
npm install
npm run dev

# Incorreto
cd /home/reinaldonascimento/Development/Projetos/Testes/docker-manager
npm install # Não instalar na raiz!
```

## Verificação de Localização
Antes de executar qualquer comando ou criar/editar arquivos:
1. Verificar o diretório atual com `pwd`
2. Garantir que está no diretório correto (frontend ou backend)
3. Se necessário, usar `cd` para navegar ao diretório apropriado

---
## self-inprove.mdc

---
description: Guidelines for continuously improving Cursor rules based on emerging code patterns and best practices.
globs: **/*
alwaysApply: true
---

- **Rule Improvement Triggers:**
  - New code patterns not covered by existing rules
  - Repeated similar implementations across files
  - Common error patterns that could be prevented
  - New libraries or tools being used consistently
  - Emerging best practices in the codebase

- **Analysis Process:**
  - Compare new code with existing rules
  - Identify patterns that should be standardized
  - Look for references to external documentation
  - Check for consistent error handling patterns
  - Monitor test patterns and coverage

- **Rule Updates:**
  - **Add New Rules When:**
    - A new technology/pattern is used in 3+ files
    - Common bugs could be prevented by a rule
    - Code reviews repeatedly mention the same feedback
    - New security or performance patterns emerge

  - **Modify Existing Rules When:**
    - Better examples exist in the codebase
    - Additional edge cases are discovered
    - Related rules have been updated
    - Implementation details have changed

- **Example Pattern Recognition:**
  ```typescript
  // If you see repeated patterns like:
  const data = await prisma.user.findMany({
    select: { id: true, email: true },
    where: { status: 'ACTIVE' }
  });

  // Consider adding to [prisma.mdc](mdc:.cursor/rules/prisma.mdc):
  // - Standard select fields
  // - Common where conditions
  // - Performance optimization patterns
  ```

- **Rule Quality Checks:**
  - Rules should be actionable and specific
  - Examples should come from actual code
  - References should be up to date
  - Patterns should be consistently enforced

- **Continuous Improvement:**
  - Monitor code review comments
  - Track common development questions
  - Update rules after major refactors
  - Add links to relevant documentation
  - Cross-reference related rules

- **Rule Deprecation:**
  - Mark outdated patterns as deprecated
  - Remove rules that no longer apply
  - Update references to deprecated rules
  - Document migration paths for old patterns
- **Documentation Updates:**
  - Keep examples synchronized with code
  - Update references to external docs
  - Maintain links between related rules
  - Document breaking changes

Follow [cursor_rules.mdc](mdc:.cursor/rules/cursor_rules.mdc) for proper rule formatting and structure.
Acompanhe o arquivo [commands.mdc](mdc:.cursor/rules/commands.mdc) para ter um guia completo dos comandos da CLI.

---
## tasks.mdc

---
description: Diretrizes para o agente no gerenciamento de tarefas e subtarefas no TaskManager
globs: utils/tasks.js, commands/create.js, commands/expand.js, commands/show.js
alwaysApply: true
---

# Diretrizes para Gerenciamento de Tarefas e Subtarefas

## Princípios Gerais

- **Hierarquia de Tarefas**:
  - ✅ FAÇA: Trate tarefas como unidades de trabalho autônomas
  - ✅ FAÇA: Use subtarefas para decompor trabalho complexo
  - ✅ FAÇA: Mantenha uma relação clara entre tarefa principal e subtarefas
  - ❌ NÃO FAÇA: Crie subtarefas órfãs ou desconectadas da tarefa principal

  ```javascript
  // ✅ FAÇA: Mantenha a hierarquia clara
  // Tarefa principal com subtarefas
  const task = {
    id: 1,
    title: "Implementar autenticação",
    // Outros campos da tarefa
    subtasks: [
      {
        id: 1, // ID local dentro da tarefa principal
        title: "Configurar rotas de autenticação",
        // Outros campos da subtarefa
      }
    ]
  };
  ```

## Estrutura e Identificação

- **Identificadores de Tarefas**:
  - ✅ FAÇA: Use IDs numéricos inteiros para tarefas principais
  - ✅ FAÇA: Use notação de ponto para subtarefas (exemplo: "1.2" para subtarefa 2 da tarefa 1)
  - ✅ FAÇA: Mantenha IDs sequenciais dentro de seu contexto
  - ❌ NÃO FAÇA: Duplique IDs ou pule a sequência

  ```javascript
  // ✅ FAÇA: Use identificação adequada
  // Ao adicionar subtarefas, atribua IDs sequenciais
  const newSubtaskId = tasksData.tasks[taskIndex].subtasks.length > 0
    ? Math.max(...tasksData.tasks[taskIndex].subtasks.map(st => st.id)) + 1
    : 1;
  ```

- **Propriedades Obrigatórias**:
  - ✅ FAÇA: Inclua todas as propriedades obrigatórias em tarefas e subtarefas:
    - Para tarefas: id, title, description, status, priority, dependencies, createdAt, updatedAt
    - Para subtarefas: id, title, description, status, createdAt, updatedAt
  - ✅ FAÇA: Use timestamps ISO para datas
  - ❌ NÃO FAÇA: Omita campos obrigatórios ou use formatos inconsistentes

  ```javascript
  // ✅ FAÇA: Inclua todas as propriedades obrigatórias
  const newTask = {
    id: newId,
    title: taskData.title || 'Nova Tarefa',
    description: taskData.description || '',
    status: taskData.status || 'pending',
    priority: taskData.priority || defaultPriority,
    dependencies: taskData.dependencies || [],
    details: taskData.details || '',
    testStrategy: taskData.testStrategy || '',
    category: taskData.category || 'feature',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: []
  };
  ```

## Manipulação de Tarefas

- **Criação**:
  - ✅ FAÇA: Valide todos os campos obrigatórios
  - ✅ FAÇA: Aplique valores padrão quando necessário
  - ✅ FAÇA: Gere IDs únicos sequenciais
  - ❌ NÃO FAÇA: Crie tarefas com dados parciais ou inconsistentes

  ```javascript
  // ✅ FAÇA: Valide e gere IDs adequadamente
  const newId = tasksData.tasks.length > 0
    ? Math.max(...tasksData.tasks.map(t => t.id)) + 1
    : 1;
  ```

- **Atualização**:
  - ✅ FAÇA: Atualize apenas os campos especificados
  - ✅ FAÇA: Mantenha o ID inalterado
  - ✅ FAÇA: Atualize o timestamp updatedAt
  - ❌ NÃO FAÇA: Substitua toda a tarefa sem preservar campos não modificados

  ```javascript
  // ✅ FAÇA: Atualize preservando campos não modificados
  const updatedTask = {
    ...tasksData.tasks[taskIndex],
    ...taskData,
    updatedAt: new Date().toISOString()
  };

  // Mantenha o ID original
  updatedTask.id = taskId;
  ```

- **Exclusão**:
  - ✅ FAÇA: Verifique dependências antes de excluir
  - ✅ FAÇA: Atualize referências após exclusão
  - ❌ NÃO FAÇA: Exclua tarefas sem verificar impactos

  ```javascript
  // ✅ FAÇA: Verifique dependências antes de excluir
  const dependentTasks = tasksData.tasks.filter(t =>
    t.dependencies && t.dependencies.includes(taskId)
  );

  if (dependentTasks.length > 0) {
    console.log(formatWarning(`Tarefa #${taskId} não pode ser removida pois outras tarefas dependem dela.`));
    return false;
  }
  ```

## Manipulação de Subtarefas

- **Criação de Subtarefas**:
  - ✅ FAÇA: Verifique se a tarefa pai existe
  - ✅ FAÇA: Atribua IDs sequenciais dentro do contexto da tarefa pai
  - ✅ FAÇA: Inclua todos os campos obrigatórios
  - ❌ NÃO FAÇA: Crie subtarefas para tarefas inexistentes

  ```javascript
  // ✅ FAÇA: Verifique se a tarefa pai existe antes de adicionar subtarefas
  const taskIndex = tasksData.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return null;
  }

  // Inicialize o array de subtarefas se não existir
  if (!tasksData.tasks[taskIndex].subtasks) {
    tasksData.tasks[taskIndex].subtasks = [];
  }
  ```

- **Atualização de Subtarefas**:
  - ✅ FAÇA: Verifique existência da tarefa pai e da subtarefa
  - ✅ FAÇA: Atualize o timestamp updatedAt da subtarefa e da tarefa pai
  - ❌ NÃO FAÇA: Mova subtarefas entre tarefas pai diferentes

  ```javascript
  // ✅ FAÇA: Atualize tarefa pai e subtarefa
  tasksData.tasks[taskIndex].subtasks[subtaskIndex].status = newStatus;
  tasksData.tasks[taskIndex].subtasks[subtaskIndex].updatedAt = now;
  tasksData.tasks[taskIndex].updatedAt = now;
  ```

- **Propagação de Status**:
  - ✅ FAÇA: Considere atualizar subtarefas quando a tarefa pai for marcada como concluída
  - ✅ FAÇA: Pergunte ao usuário antes de propagar status
  - ❌ NÃO FAÇA: Propague status automaticamente sem confirmação

  ```javascript
  // ✅ FAÇA: Propague status com confirmação
  if (newStatus === 'completed' && task.subtasks && task.subtasks.length > 0) {
    const { updateSubtasks } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'updateSubtasks',
        message: 'Deseja marcar todas as subtarefas como concluídas também?',
        default: true
      }
    ]);

    if (updateSubtasks) {
      task.subtasks = task.subtasks.map(sub => ({
        ...sub,
        status: 'completed',
        updatedAt: new Date().toISOString()
      }));
    }
  }
  ```

## Expansão de Tarefas

- **Análise de Complexidade**:
  - ✅ FAÇA: Analise o contexto completo da tarefa para expansão
  - ✅ FAÇA: Use IA para sugerir decomposição lógica quando disponível
  - ✅ FAÇA: Considere dependências entre subtarefas
  - ❌ NÃO FAÇA: Divida tarefas de forma arbitrária ou inconsistente

  ```javascript
  // ✅ FAÇA: Use análise da tarefa para expansão
  const taskContext = {
    title: task.title,
    description: task.description || '',
    details: task.details || '',
    category: task.category || '',
    testStrategy: task.testStrategy || '',
    existingSubtasks: task.subtasks || []
  };

  // Use IA para análise avançada quando disponível
  const analysisResult = await callPerplexityAPI(taskContext, numSubtasks);
  ```

- **Subtarefas Balanceadas**:
  - ✅ FAÇA: Crie subtarefas com escopo similar
  - ✅ FAÇA: Mantenha subtarefas focadas em uma única responsabilidade
  - ✅ FAÇA: Defina dependências entre subtarefas quando necessário
  - ❌ NÃO FAÇA: Crie subtarefas desproporcionais ou genéricas demais
  ```javascript
  // ✅ FAÇA: Defina subtarefas bem equilibradas
  const subtasksToAdd = [
    {
      title: "Configurar estrutura do banco de dados",
      description: "Criar tabelas, índices e relacionamentos necessários"
    },
    {
      title: "Implementar queries de acesso",
      description: "Desenvolver funções para CRUD de dados"
    },
    {
      title: "Criar testes de integração",
      description: "Garantir que a persistência funcione corretamente"
    }
  ];
  ```

## Visualização e Navegação

- **Formatação de Saída**:
  - ✅ FAÇA: Mostre claramente a hierarquia entre tarefas e subtarefas
  - ✅ FAÇA: Use indentação e formatação visual para indicar relações
  - ✅ FAÇA: Inclua indicadores de status distintos
  - ❌ NÃO FAÇA: Apresente tarefas e subtarefas sem distinção clara

  ```javascript
  // ✅ FAÇA: Formate adequadamente a exibição
  if (task.subtasks && task.subtasks.length > 0) {
    output += `\n${chalk.bold('Subtarefas:')}\n`;
    for (const subtask of task.subtasks) {
      const statusIcon = subtask.status === 'done'
        ? chalk.green('✅')
        : subtask.status === 'in-progress'
          ? chalk.blue('🔄')
          : chalk.yellow('⏳');

      output += `${statusIcon} ${subtask.id}. ${subtask.title}\n`;

      if (subtask.description) {
        output += `   ${chalk.gray(subtask.description)}\n`;
      }
    }
  }
  ```

- **Navegação entre Tarefas**:
  - ✅ FAÇA: Permita navegar facilmente entre tarefas e subtarefas relacionadas
  - ✅ FAÇA: Forneça links ou comandos para acessar tarefas dependentes
  - ✅ FAÇA: Exiba informações de contexto relevantes
  - ❌ NÃO FAÇA: Force o usuário a memorizar IDs ou relacionamentos

  ```javascript
  // ✅ FAÇA: Facilite a navegação entre tarefas
  console.log(chalk.bold.blue('\n=== COMANDOS ÚTEIS ==='));
  console.log(`
  ${chalk.cyan('Ver tarefa principal:')}
  taskmanager show ${parentTaskId}

  ${chalk.cyan('Ver detalhes da subtarefa:')}
  taskmanager show ${taskId}.${subtaskId}

  ${chalk.cyan('Atualizar status da subtarefa:')}
  taskmanager set status ${taskId}.${subtaskId}
  `);
  ```

## Considerações Avançadas

- **Agrupamento e Categorização**:
  - ✅ FAÇA: Use categorias para agrupar tarefas relacionadas
  - ✅ FAÇA: Permita filtrar e visualizar por categoria
  - ❌ NÃO FAÇA: Misture categorias inconsistentemente

  ```javascript
  // ✅ FAÇA: Use categorias consistentemente
  const task = {
    // Outros campos
    category: 'backend', // Categoria da tarefa: backend, frontend, database, etc.
  };
  ```

- **Documentação e Contexto**:
  - ✅ FAÇA: Mantenha descrições detalhadas e contextuais
  - ✅ FAÇA: Inclua detalhes técnicos e estratégias de teste
  - ✅ FAÇA: Documente decisões e abordagens
  - ❌ NÃO FAÇA: Use descrições vagas ou genéricas demais

  ```javascript
  // ✅ FAÇA: Inclua contexto detalhado
  const task = {
    // Outros campos
    details: "Utilizar JWT para tokens, Redis para armazenamento de sessão, e implementar refresh tokens com rotação. Considerar proteção contra CSRF.",
    testStrategy: "Usar Jest para testes unitários e Supertest para testes de integração. Cobrir casos de sucesso, falha de credenciais e expiração de token."
  };
  ```

Consulte `utils/tasks.js`, `commands/create.js`, `commands/expand.js` e `commands/show.js` para implementações e maiores detalhes sobre o gerenciamento de tarefas e subtarefas no TaskManager.

Acompanhe o arquivo [commands.mdc](mdc:.cursor/rules/commands.mdc) para saber mais sobre os comandos da CLI.
