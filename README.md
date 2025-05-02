# TaskManager AI CLI

![TaskManager Logo](https://via.placeholder.com/150?text=TaskManager)

[![NPM Version](https://img.shields.io/npm/v/taskmanager.svg)](https://npmjs.org/package/taskmanager)
[![NPM Downloads](https://img.shields.io/npm/dm/taskmanager.svg)](https://npmjs.org/package/taskmanager)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

An intelligent command line tool for development task management. TaskManager integrates automation, artificial intelligence, and development best practices to organize, prioritize, and track tasks, facilitating team collaboration and promoting more agile, traceable, and documented deliveries.

## 🚀 Features

- **Intuitive Task Management**: Create, organize, and track project tasks with ease
- **AI Integration**: Use multiple AI providers for task generation and analysis
- **Smart Expansion**: Break down complex tasks into manageable subtasks
- **Dependency Tracking**: Visualize and manage task dependencies
- **Automatic Documentation**: Generate PRDs and documentation for your tasks
- **Multiple Workflow Support**: Adapt to different development methodologies
- **Intelligent Agent Integration**: Generate instructions for AI coding assistants

## 📦 Installation

```bash
# Global installation (recommended)
npm install -g taskmanager

# Local installation
npm install taskmanager
```

## 🔧 Setup

After installation, initialize TaskManager in your project:

```bash
taskmanager init
```

The `init` command will create the necessary structure and ask questions about your project for initial configuration.

### AI Configuration (Optional)

To leverage AI features, configure your API keys:

1. Copy the `.taskmanager/.env.example` file to `.taskmanager/.env`
2. Add your API keys (OpenAI, Anthropic, HuggingFace, or Perplexity)
3. Set `AI_ENABLED=true` in the .env file

## 📋 Main Commands

### Initialization

```bash
# Initialize TaskManager in the current project
taskmanager init
```

### Creating Tasks

```bash
# Start the interactive creation assistant
taskmanager create

# Generate tasks using AI
taskmanager create --ai

# Create task with specific title
taskmanager create -t "Implement authentication"
```

### Viewing Tasks

```bash
# List all tasks
taskmanager list

# List tasks with subtasks
taskmanager list --show-subtasks

# Show details of a specific task
taskmanager show 1

# Show the next task to be implemented
taskmanager next

# Show the task currently in development
taskmanager current
```

### Task Management

```bash
# Update task status
taskmanager set status 1 in-progress
taskmanager set status 1 done

# Update subtask status
taskmanager set status 1.2 done
```

### Expansion and Analysis

```bash
# Expand task into subtasks with AI
taskmanager expand 1 --ai

# Expand task into 5 subtasks
taskmanager expand 1 --num=5

# Generate PRDs for documentation
taskmanager parse
```

### Backup and Restore

```bash
# Restore task backup
taskmanager create --restore

# Reset and recreate basic tasks
taskmanager create --reset
```

## 📊 Example Workflow

1. Initialize project: `taskmanager init`
2. Create initial tasks: `taskmanager create --ai`
3. See next available task: `taskmanager next`
4. Start working: `taskmanager set status 1 in-progress`
5. View details: `taskmanager show 1`
6. Break down into subtasks if needed: `taskmanager expand 1 --ai`
7. Work on subtasks: `taskmanager set status 1.1 done`
8. Complete main task: `taskmanager set status 1 done`
9. Continue with next task: `taskmanager next`

## 🤖 AI Integration

TaskManager supports multiple AI providers:

- **OpenAI**: GPT-4o, GPT-4-turbo, GPT-4o-mini, GPT-4.5, GPT-3.5-turbo
- **Anthropic**: Claude 3 Opus, Claude 3.5 Sonnet, Claude 3.7 Sonnet
- **HuggingFace**: Mixtral, Mistral, Llama 3
- **Perplexity**: Sonar Pro, Mistral, Llama 3

Configure your preferred provider in the `.taskmanager/.env` file.

## 🤝 Contributing

Contributions are welcome! Please read the [contribution guidelines](CONTRIBUTING.md) before submitting a pull request.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
