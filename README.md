# Habit Tracker DevOps Mini Project

This is a simple college mini project based on one Java Spring Boot application.

Tools used:

- GitHub for source code
- Maven for build and test
- Docker and Docker Compose for container run
- Jenkins for CI
- Kubernetes with Minikube for deployment

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
- `Jenkinsfile` Jenkins pipeline for build and deploy
- `k8s/app.yaml` simple Kubernetes file
- `Makefile` shortcut commands

## Prerequisites

- Java 17
- Maven
- Docker
- Jenkins
- Minikube
- kubectl

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

Jenkins should handle the full flow:

1. Checkout code from GitHub
2. Run `mvn clean test`
3. Run `mvn clean package -DskipTests`
4. Check Docker Compose file
5. Build Docker image inside Minikube
6. Deploy to Kubernetes with `kubectl apply`

Jenkins tools needed:

- `jdk17`
- `maven3`

Jenkins machine also needs:

- Docker
- Minikube
- kubectl

Important:

- The Jenkins pipeline now deploys the app to Kubernetes
- You do not need to run `make k8s-apply` manually if Jenkins deployment is working
- If Jenkins is running inside a Docker container, that container must have access to `docker`, `kubectl`, and `minikube`

## Kubernetes With Minikube

Start Minikube:

```bash
minikube start
```

For manual testing outside Jenkins, build Docker image inside Minikube:

```bash
eval $(minikube docker-env)
make docker-build
```

Apply Kubernetes file:

```bash
make k8s-apply
```

If Jenkins is being used properly, Jenkins does these steps automatically.

Access app:

```bash
minikube service habit-backend -n habit-tracker
```

Delete:

```bash
make k8s-delete
```

## Easy Explanation Of Tool Usage

- GitHub stores the project code
- Maven builds and tests the Java app
- Docker packages the app into an image
- Docker Compose runs app and database together
- Jenkins automates test, package, docker build, and Kubernetes deploy
- Kubernetes runs the app in Minikube

## Viva Flow

1. Show the Java app and API
2. Show `mvn test`
3. Show `docker compose up`
4. Show Jenkins pipeline doing build and deployment
5. Show `kubectl get all -n habit-tracker`
