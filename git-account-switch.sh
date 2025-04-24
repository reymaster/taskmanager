#!/bin/bash

# Script para alternar entre contas do GitHub

if [ -z "$1" ]; then
    echo "Uso: ./git-account-switch.sh [reinaldoqd|reymaster]"
    exit 1
fi

case $1 in
    "reinaldoqd")
        git config user.name "ReinaldoQD"
        git config user.email "reinaldoqd@gmail.com"
        echo "Configurado para usar conta ReinaldoQD"
        ;;
    "reymaster")
        git config user.name "ReyMaster"
        git config user.email "reymaster@gmail.com"
        echo "Configurado para usar conta ReyMaster"
        ;;
    *)
        echo "Conta inválida. Use reinaldoqd ou reymaster"
        exit 1
        ;;
esac
