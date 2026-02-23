#!/bin/bash

echo "========================================="
echo "Running pytest tests"
echo "========================================="
echo ""

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Run pytest with various options
case "${1:-all}" in
    "fast")
        echo "Running fast tests only..."
        pytest -v -m "not slow"
        ;;
    "coverage")
        echo "Running tests with coverage..."
        pytest --cov=app --cov-report=html --cov-report=term
        echo ""
        echo "Coverage report generated in htmlcov/index.html"
        ;;
    "verbose")
        echo "Running tests with verbose output..."
        pytest -vv -s
        ;;
    "failed")
        echo "Re-running only failed tests..."
        pytest --lf -v
        ;;
    "specific")
        echo "Running specific test: $2"
        pytest -v "$2"
        ;;
    "all"|*)
        echo "Running all tests..."
        pytest -v
        ;;
esac

echo ""
echo "========================================="
echo "Tests complete"
echo "========================================="
