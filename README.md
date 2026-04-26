# Habit Tracker DevOps Mini Project

This is a simple college mini project based on one Java Spring Boot application.

Tools used:

- GitHub for source code
- Maven for build and test
- Docker and Docker Compose for container run
- Jenkins for CI
- Kubernetes with Minikube for deployment
- Terraform for applying Kubernetes resources

## What The App Does

This is a small habit tracker backend with PostgreSQL.

Main endpoints:

- `GET /api/habits`
- `POST /api/habits`
- `POST /api/habits/{id}/complete`

Backend runs on:

- `http://localhost:8081`

## Project Structure

- `backend/` Java Spring Boot app
- `Dockerfile` Docker image for backend
- `docker-compose.yml` backend + PostgreSQL
- `Jenkinsfile` simple Jenkins pipeline
- `k8s/app.yaml` simple Kubernetes file
- `terraform/` Terraform for the same Kubernetes resources
- `Makefile` shortcut commands

## Prerequisites

- Java 17
- Maven
- Docker
- Jenkins
- Minikube
- kubectl
- Terraform

## Run Locally With Maven

Start only PostgreSQL:

```bash
docker compose up -d db
```

Then run the backend:

```bash
make backend-test
make backend-run
```

Note:

- Docker PostgreSQL is exposed on host port `5433`
- Inside Docker it still runs on container port `5432`

## Run With Docker Compose

```bash
make docker-up
```

Open:

- `http://localhost:8081/api/habits`

Stop:

```bash
make docker-down
```

## Jenkins

Jenkins pipeline steps are:

1. Checkout code
2. Run `mvn clean test`
3. Run `mvn clean package -DskipTests`
4. Check Docker Compose file
5. Build Docker image

Jenkins tools needed:

- `jdk17`
- `maven3`

## Kubernetes With Minikube

Start Minikube:

```bash
minikube start
```

Build Docker image inside Minikube:

```bash
eval $(minikube docker-env)
make docker-build
```

Apply Kubernetes file:

```bash
make k8s-apply
```

Access app:

```bash
minikube service habit-backend -n habit-tracker
```

Delete:

```bash
make k8s-delete
```

## Terraform

Terraform applies the same backend and PostgreSQL resources to Kubernetes.

```bash
make tf-init
make tf-apply
```

Destroy:

```bash
make tf-destroy
```

## Easy Explanation Of Tool Usage

- GitHub stores the project code
- Maven builds and tests the Java app
- Docker packages the app into an image
- Docker Compose runs app and database together
- Jenkins automates test, package, and docker build
- Kubernetes runs the app in Minikube
- Terraform creates the Kubernetes resources using code

## Viva Flow

1. Show the Java app and API
2. Show `mvn test`
3. Show `docker compose up`
4. Show Jenkins pipeline
5. Show `kubectl get all -n habit-tracker`
6. Show `terraform apply`
