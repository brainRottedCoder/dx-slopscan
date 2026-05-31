# Hugo — DX SlopScan
# One-command operations for development, testing, and deployment.

.PHONY: help install test benchmark adversarial demo deploy deploy-verify clean corpus dataset

help:
	@echo "Hugo — DX SlopScan"
	@echo ""
	@echo "Commands:"
	@echo "  make install       Install all dependencies"
	@echo "  make test          Run unit tests (no model required)"
	@echo "  make benchmark     Run fast benchmark on labeled corpus"
	@echo "  make adversarial   Run 50-attack adversarial test suite"
	@echo "  make corpus        Regenerate benchmark-corpus JSONL"
	@echo "  make demo          Start local demo (requires .env)"
	@echo "  make deploy-local  Start production stack via Docker Compose"
	@echo "  make deploy        Deploy backend to Railway"
	@echo "  make lint          Run linting"
	@echo "  make clean         Remove build artifacts"
	@echo ""
	@echo "Environment variables:"
	@echo "  HUGO_API_URL      Backend URL (default: http://localhost:8000)"
	@echo "  GITHUB_TOKEN       GitHub token (increases rate limit to 5000/hr)"

install:
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "Installing CLI..."
	cd cli && npm install
	@echo "Installing frontend..."
	cd frontend && npm install
	@echo "✅ Installation complete"

test:
	@echo "Running unit tests..."
	cd backend && python -m pytest tests/test_signals.py -v --tb=short
	@echo "✅ Tests complete"

benchmark:
	@echo "Running benchmark (fast mode — reasoning, coverage, mirror, anchor, lean)..."
	@echo "Note: novelty/reach use TF-IDF fallback in fast mode. Use 'make benchmark-full' for embedding model."
	cd backend && python ../benchmark-corpus/_benchmark_runner.py
	@echo "✅ Results saved to benchmark-corpus/benchmark_results.json"

benchmark-full:
	@echo "Running full benchmark (requires sentence-transformer model ~90MB)..."
	cd backend && python ../benchmark-corpus/evaluate.py --full
	@echo "✅ Full benchmark complete"

adversarial:
	@echo "Running adversarial test suite (50 attack scenarios)..."
	cd backend && python ../benchmark-corpus/adversarial_test.py
	@echo "✅ Adversarial test complete"

corpus:
	@echo "Generating benchmark corpus..."
	python3 benchmark-corpus/generate_corpus.py
	@echo "✅ Corpus generated"

dataset: corpus
	@echo "(alias) use: make corpus"

demo:
	@echo "Starting Hugo demo..."
	@echo "Backend:  http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	docker-compose up

demo-backend:
	cd backend && uvicorn main:app --reload --port 8000

demo-frontend:
	cd frontend && npm run dev

install-hook:
	@echo "Installing Hugo pre-commit hook..."
	cp hooks/pre-commit .git/hooks/pre-commit
	chmod +x .git/hooks/pre-commit
	@echo "✅ Hook installed. Set HUGO_API_URL and HUGO_THRESHOLD in your environment."

lint:
	cd backend && python -m flake8 detection/ core/ --max-line-length=120 --ignore=E501 || true

deploy-local:
	docker-compose -f docker-compose.prod.yml up --build

deploy-verify:
	@echo "=== Deployment readiness ==="
	cd backend && python -m pytest tests/test_signals.py -q --tb=line
	cd frontend && npm run build
	@echo "✅ Tests and production build passed. See DEPLOYMENT.md for hosting steps."

deploy:
	@echo "Deploying backend to Railway..."
	cd backend && railway up
	@echo "Deploying frontend to Vercel..."
	cd frontend && vercel --prod

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	find . -type d -name .next -exec rm -rf {} + 2>/dev/null || true
	@echo "✅ Cleaned"

ci:
	make test
	make benchmark
	make adversarial
	@echo "✅ All CI checks passed"

cross-validate:
	@echo "Running cross-validation and ablation study..."
	cd backend && python ../benchmark-corpus/cross_validate.py
	@echo "✅ Results saved to benchmark-corpus/cross_validation_results.json"

full-ci: test benchmark adversarial cross-validate
	@echo "✅ Full CI complete"
