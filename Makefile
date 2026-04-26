SHELL := /bin/bash

.PHONY: help backend-test backend-run docker-up docker-down docker-build k8s-apply k8s-delete tf-init tf-apply tf-destroy

help:
	@echo "Available targets:"
	@echo "  backend-test   - Run backend tests with Maven"
	@echo "  backend-run    - Run Spring Boot backend on port 8081"
	@echo "  docker-build   - Build backend Docker image"
	@echo "  docker-up      - Start backend + PostgreSQL with Docker Compose"
	@echo "  docker-down    - Stop Docker Compose stack"
	@echo "  k8s-apply      - Apply simple Kubernetes manifests"
	@echo "  k8s-delete     - Delete Kubernetes manifests"
	@echo "  tf-init        - Initialize Terraform"
	@echo "  tf-apply       - Apply Terraform"
	@echo "  tf-destroy     - Destroy Terraform-managed resources"

backend-test:
	cd backend && mvn clean test

backend-run:
	cd backend && DB_URL=jdbc:postgresql://localhost:5433/habit_tracker DB_USERNAME=habit_user DB_PASSWORD=habit_password mvn spring-boot:run

docker-build:
	docker build -t habit-tracker-backend:latest .

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

k8s-apply:
	kubectl apply -f k8s/

k8s-delete:
	kubectl delete -f k8s/ --ignore-not-found

tf-init:
	cd terraform && terraform init

tf-apply:
	cd terraform && terraform apply -auto-approve

tf-destroy:
	cd terraform && terraform destroy -auto-approve
