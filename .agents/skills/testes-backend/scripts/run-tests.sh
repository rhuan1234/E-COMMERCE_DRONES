#!/usr/bin/env bash
# ==============================================================================
# Script de Execução e Verificação de Testes de Backend (Quarkus / Java 25)
# Repositório: E-Commerce de Drones
# ==============================================================================

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/../../../../backend" && pwd)"

echo "===================================================================="
echo " 🛸 E-COMMERCE DE DRONES - EXECUTOR DE TESTES BACKEND (QUARKUS)"
echo "===================================================================="
echo "Diretório Backend: ${BACKEND_DIR}"
echo ""

cd "${BACKEND_DIR}"

TEST_ARG=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --test|-t)
            TEST_ARG="-Dtest=$2"
            shift 2
            ;;
        --help|-h)
            echo "Uso: ./run-tests.sh [opções]"
            echo ""
            echo "Opções:"
            echo "  --test, -t <Nome>   Executa uma classe ou método específico (ex: PedidoResourceTest ou PedidoResourceTest#deveCriarPedido)"
            echo "  --all, -a           Executa a suíte completa de testes"
            echo "  --help, -h          Exibe esta ajuda"
            exit 0
            ;;
        --all|-a)
            TEST_ARG=""
            shift
            ;;
        *)
            echo "Opção desconhecida: $1"
            echo "Use --help para ver as opções disponíveis."
            exit 1
            ;;
    esac
done

START_TIME=$(date +%s)

if [ -n "${TEST_ARG}" ]; then
    echo "▶️  Executando teste específico: ${TEST_ARG}"
    ./mvnw test "${TEST_ARG}"
else
    echo "▶️  Executando suíte completa de testes..."
    ./mvnw test
fi

EXIT_CODE=$?
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))

echo ""
echo "===================================================================="
if [ ${EXIT_CODE} -eq 0 ]; then
    echo "✅ SUCESSO: Todos os testes executados foram aprovados!"
    echo "⏱️  Tempo total de execução: ${ELAPSED}s"
else
    echo "❌ FALHA: Houve falha na execução dos testes (Código: ${EXIT_CODE})."
    echo "Inspecione os relatórios em: target/surefire-reports/"
fi
echo "===================================================================="

exit ${EXIT_CODE}
