/**
 * Módulo de simulação de tarefas
 *
 * Este módulo fornece funcionalidade para simular a geração de tarefas
 * quando a integração com IA não está disponível ou falha.
 */

// Mapeamento de contextos para prompts específicos
export const contextPrompts = {
    initial: "Gere tarefas para a estrutura inicial do projeto",
    feature: "Gere tarefas para implementar um novo módulo ou funcionalidade",
    bugfix: "Gere tarefas para correção de bugs no projeto",
    testing: "Gere tarefas para implementação de testes no projeto",
    documentation: "Gere tarefas para documentação do projeto",
    refactoring: "Gere tarefas para refatoração do código existente",
    performance: "Gere tarefas para otimização de desempenho",
    security: "Gere tarefas para melhorar a segurança do projeto",
    dependencies: "Gere tarefas para atualização de dependências"
  };

  /**
   * Simula a geração de tarefas quando não há IA disponível
   * @param {String} projectDescription - Descrição detalhada do projeto
   * @param {String} projectType - Tipo de projeto ('new' ou 'existing')
   * @param {Number} taskCount - Número de tarefas a serem geradas
   * @returns {Array} Array de tarefas simuladas
   */
  export function simulateTasks(projectDescription, projectType, taskCount = 5) {
    console.log('>>>simulateTasks', projectType, taskCount, '<<<');
    // Extrai informações básicas da descrição do projeto
    const lines = projectDescription.split('\n');
    let projectName = 'Projeto';
    let technologies = [];

    for (const line of lines) {
      if (line.startsWith('Nome do Projeto:')) {
        projectName = line.replace('Nome do Projeto:', '').trim();
      } else if (line.startsWith('Tecnologias:')) {
        const techString = line.replace('Tecnologias:', '').trim();
        technologies = techString.split(',').map(t => t.trim());
      }
    }

    // Gerar tarefas simuladas com base no tipo de projeto
    const now = new Date().toISOString();

    if (!projectType || projectType === 'new') {
      return generateTasksForNewProject(projectName, technologies, taskCount, now, projectType);
    } else {
      return generateTasksForExistingProject(projectDescription, projectName, technologies, taskCount, now);
    }
  }

  /**
   * Gera tarefas para um novo projeto
   * @param {String} projectName - Nome do projeto
   * @param {Array} technologies - Array de tecnologias
   * @param {Number} taskCount - Número de tarefas a serem geradas
   * @param {String} timestamp - Timestamp para as tarefas
   * @returns {Array} Array de tarefas
   */
  function generateTasksForNewProject(projectName, technologies, taskCount, timestamp, projectType) {
    // Tarefas para projeto novo
    const initialTasks = [
      {
        id: 1,
        title: `Configurar estrutura inicial do ${projectName}`,
        description: 'Criar a estrutura de diretórios e arquivos básicos do projeto.',
        status: 'pending',
        priority: 'high',
        dependencies: [],
        details: 'Criar os diretórios principais e configurar o sistema de build/compilação.',
        testStrategy: 'Verificar se todos os diretórios foram criados corretamente.',
        category: 'setup',
        createdAt: timestamp,
        updatedAt: timestamp,
        subtasks: [
          {
            id: 1,
            title: 'Criar estrutura de diretórios',
            description: 'Definir e criar diretórios base do projeto.',
            status: 'pending',
            createdAt: timestamp,
            updatedAt: timestamp
          },
          {
            id: 2,
            title: 'Configurar sistema de build',
            description: 'Configurar o processo de build/compilação.',
            status: 'pending',
            createdAt: timestamp,
            updatedAt: timestamp
          }
        ]
      },
      {
        id: 2,
        title: 'Configurar ambiente de desenvolvimento',
        description: 'Preparar o ambiente de desenvolvimento com as ferramentas necessárias.',
        status: 'pending',
        priority: 'high',
        dependencies: [1],
        details: 'Configurar linters, formatadores e ferramentas de debug.',
        testStrategy: 'Verificar se o ambiente de desenvolvimento está funcionando corretamente.',
        category: 'setup',
        createdAt: timestamp,
        updatedAt: timestamp,
        subtasks: []
      },
      {
        id: 3,
        title: 'Criar documentação inicial',
        description: 'Criar a documentação básica do projeto, incluindo README.',
        status: 'pending',
        priority: 'medium',
        dependencies: [1],
        details: 'Documentar a estrutura, requisitos e instruções de instalação.',
        testStrategy: 'Verificar se a documentação está clara e completa.',
        category: 'documentation',
        createdAt: timestamp,
        updatedAt: timestamp,
        subtasks: []
      }
    ];

    // Adicionar tarefas específicas com base nas tecnologias
    let idCounter = 4;

    // Tarefas para o frontend
    if (technologies.some(t => ['javascript', 'typescript', 'react', 'vue', 'angular'].includes(t.toLowerCase()))) {
      initialTasks.push({
        id: idCounter++,
        title: 'Configurar ambiente frontend',
        description: 'Configurar o ambiente de desenvolvimento frontend.',
        status: 'pending',
        priority: 'high',
        dependencies: [2],
        details: technologies.some(t => t.toLowerCase() === 'react')
          ? 'Configurar React com estrutura de componentes'
          : technologies.some(t => t.toLowerCase() === 'vue')
            ? 'Configurar Vue.js com estrutura de componentes'
            : technologies.some(t => t.toLowerCase() === 'angular')
              ? 'Configurar Angular com módulos e componentes'
              : 'Configurar estrutura frontend básica',
        testStrategy: 'Verificar se o ambiente frontend está funcionando corretamente.',
        category: 'frontend',
        createdAt: timestamp,
        updatedAt: timestamp,
        subtasks: []
      });
    }

    // Tarefas para o backend
    if (technologies.some(t => ['nodejs', 'express', 'python', 'django', 'flask', 'java', 'spring', 'csharp', 'dotnet', 'php', 'laravel', 'ruby', 'rails', 'go'].includes(t.toLowerCase()))) {
      initialTasks.push({
        id: idCounter++,
        title: 'Configurar ambiente backend',
        description: 'Configurar o ambiente de desenvolvimento backend.',
        status: 'pending',
        priority: 'high',
        dependencies: [2],
        details: technologies.some(t => t.toLowerCase() === 'nodejs' || t.toLowerCase() === 'express')
          ? 'Configurar Node.js com estrutura de rotas e controllers'
          : technologies.some(t => t.toLowerCase() === 'python' || t.toLowerCase() === 'django' || t.toLowerCase() === 'flask')
            ? 'Configurar ambiente Python com estrutura de aplicação'
            : technologies.some(t => t.toLowerCase() === 'java' || t.toLowerCase() === 'spring')
              ? 'Configurar Java com estrutura de serviços e controllers'
              : 'Configurar estrutura backend básica',
        testStrategy: 'Verificar se o ambiente backend está funcionando corretamente.',
        category: 'backend',
        createdAt: timestamp,
        updatedAt: timestamp,
        subtasks: []
      });
    }

    // Tarefas para banco de dados
    initialTasks.push({
      id: idCounter++,
      title: 'Configurar banco de dados',
      description: 'Configurar conexão e estrutura do banco de dados.',
      status: 'pending',
      priority: 'high',
      dependencies: [projectType === 'new' ? 1 : []],
      details: 'Definir esquema, criar migrations e configurar conexão com o banco de dados.',
      testStrategy: 'Verificar se a conexão com o banco de dados está funcionando corretamente.',
      category: 'database',
      createdAt: timestamp,
      updatedAt: timestamp,
      subtasks: []
    });

    // Limitar ao número de tarefas solicitado
    return initialTasks.slice(0, taskCount);
  }

  /**
   * Gera tarefas para um projeto existente
   * @param {String} projectDescription - Descrição do projeto
   * @param {String} projectName - Nome do projeto
   * @param {Array} technologies - Array de tecnologias
   * @param {Number} taskCount - Número de tarefas a serem geradas
   * @param {String} timestamp - Timestamp para as tarefas
   * @returns {Array} Array de tarefas
   */
  function generateTasksForExistingProject(projectDescription, projectName, technologies, taskCount, timestamp, projectType) {
    // Tentar identificar o contexto a partir da descrição
    let context = 'feature'; // Padrão: nova funcionalidade

    // Procurar palavras-chave para determinar o contexto
    const description = projectDescription.toLowerCase();
    if (description.includes('bug') || description.includes('erro') || description.includes('falha')) {
      context = 'bugfix';
    } else if (description.includes('teste') || description.includes('testing')) {
      context = 'testing';
    } else if (description.includes('document') || description.includes('readme')) {
      context = 'documentation';
    } else if (description.includes('refatora') || description.includes('refactor')) {
      context = 'refactoring';
    } else if (description.includes('desempenho') || description.includes('performance')) {
      context = 'performance';
    } else if (description.includes('segurança') || description.includes('security')) {
      context = 'security';
    } else if (description.includes('dependênci') || description.includes('atualiza')) {
      context = 'dependencies';
    }

    // Gerar tarefas simuladas com base no contexto
    const contextTasks = [];

    // Adicionar descrição fictícia para contexto
    let contextDescription = projectDescription;
    if (contextDescription.length < 100) {
      contextDescription += ' ' + contextPrompts[context] || '';
    }

    for (let i = 0; i < taskCount; i++) {
      const taskId = i + 1;
      let taskTitle, taskDescription, taskDetails, taskTestStrategy;

      switch (context) {
        case 'bugfix':
          taskTitle = `Corrigir bug #${taskId} no ${projectName}`;
          taskDescription = `Investigar e corrigir o bug identificado no sistema.`;
          taskDetails = `Identificar a causa raiz do problema e implementar correção.`;
          taskTestStrategy = `Criar teste que reproduz o bug e verificar se a correção resolve o problema.`;
          break;

        case 'testing':
          taskTitle = `Implementar testes para o módulo ${i + 1} do ${projectName}`;
          taskDescription = `Criar testes unitários e de integração para o módulo.`;
          taskDetails = `Identificar casos de teste críticos e implementar testes automatizados.`;
          taskTestStrategy = `Verificar a cobertura de código e a qualidade dos testes.`;
          break;

        case 'documentation':
          taskTitle = `Documentar módulo ${i + 1} do ${projectName}`;
          taskDescription = `Criar documentação técnica para o módulo.`;
          taskDetails = `Documentar APIs, funcionamento interno e exemplos de uso.`;
          taskTestStrategy = `Revisar a documentação com a equipe para garantir clareza e completude.`;
          break;

        case 'refactoring':
          taskTitle = `Refatorar módulo ${i + 1} do ${projectName}`;
          taskDescription = `Melhorar a qualidade do código do módulo existente.`;
          taskDetails = `Identificar problemas de design e implementar soluções mais limpas.`;
          taskTestStrategy = `Verificar se os testes existentes continuam passando após a refatoração.`;
          break;

        case 'performance':
          taskTitle = `Otimizar desempenho do módulo ${i + 1} do ${projectName}`;
          taskDescription = `Identificar e resolver gargalos de desempenho.`;
          taskDetails = `Analisar métricas de desempenho e implementar melhorias.`;
          taskTestStrategy = `Medir o desempenho antes e depois das otimizações para verificar melhorias.`;
          break;

        case 'security':
          taskTitle = `Melhorar segurança do módulo ${i + 1} do ${projectName}`;
          taskDescription = `Identificar e resolver vulnerabilidades de segurança.`;
          taskDetails = `Realizar análise de segurança e implementar correções para vulnerabilidades encontradas.`;
          taskTestStrategy = `Realizar testes de penetração para verificar se as vulnerabilidades foram resolvidas.`;
          break;

        case 'dependencies':
          taskTitle = `Atualizar dependências do módulo ${i + 1} do ${projectName}`;
          taskDescription = `Atualizar bibliotecas e dependências para as versões mais recentes.`;
          taskDetails = `Identificar dependências desatualizadas e realizar atualizações compatíveis.`;
          taskTestStrategy = `Verificar se o sistema continua funcionando corretamente após as atualizações.`;
          break;

        case 'feature':
        default:
          taskTitle = `Implementar funcionalidade ${i + 1} para o ${projectName}`;
          taskDescription = `Desenvolver nova funcionalidade para o sistema.`;
          taskDetails = `Criar componentes, serviços e endpoints necessários para a nova funcionalidade.`;
          taskTestStrategy = `Criar testes unitários e de integração para garantir o funcionamento correto.`;
          break;
      }

      contextTasks.push({
        id: taskId,
        title: taskTitle,
        description: taskDescription,
        status: 'pending',
        priority: i === 0 ? 'high' : i < 2 ? 'medium' : 'low',
        dependencies: i > 0 ? [i] : [],
        details: taskDetails,
        testStrategy: taskTestStrategy,
        category: context,
        createdAt: timestamp,
        updatedAt: timestamp,
        subtasks: i < 2 ? [
          {
            id: 1,
            title: `Subtarefa 1 para ${taskTitle}`,
            description: `Primeira etapa para implementar a tarefa.`,
            status: 'pending',
            createdAt: timestamp,
            updatedAt: timestamp
          },
          {
            id: 2,
            title: `Subtarefa 2 para ${taskTitle}`,
            description: `Segunda etapa para implementar a tarefa.`,
            status: 'pending',
            createdAt: timestamp,
            updatedAt: timestamp
          }
        ] : []
      });
    }

    return contextTasks;
  }
