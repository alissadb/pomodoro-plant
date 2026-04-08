.PHONY: serve test dev kill-port help

# Default port
PORT ?= 8000

# Kill any process using the port
kill-port:
	@echo "Checking for processes on port $(PORT)..."
	@lsof -ti:$(PORT) | xargs kill -9 2>/dev/null || echo "No process running on port $(PORT)"

# Run the development server
serve: kill-port
	@echo "Starting development server on http://localhost:$(PORT)..."
	uv run python -m http.server $(PORT)

# Run tests
test:
	@echo "Running tests..."
	npm test

# Run both serve and open browser (optional convenience target)
dev: kill-port
	@echo "Starting development server on http://localhost:$(PORT)..."
	@uv run python -m http.server $(PORT) & 
	@sleep 1
	@open http://localhost:$(PORT) 2>/dev/null || xdg-open http://localhost:$(PORT) 2>/dev/null || echo "Server running at http://localhost:$(PORT)"

# Show available commands
help:
	@echo "Available commands:"
	@echo "  make serve     Start dev server on http://localhost:$(PORT)"
	@echo "  make test      Run test suite"
	@echo "  make dev       Start server and open browser"
	@echo "  make kill-port Kill process using PORT (default: 8000)"
	@echo ""
	@echo "Override the port with: make serve PORT=9000"
