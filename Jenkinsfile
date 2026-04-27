pipeline {
    agent any

    tools {
        jdk 'jdk17'
        maven 'maven3'
    }

    environment {
        IMAGE_NAME_BACKEND = "habit-tracker-backend:latest"
        IMAGE_NAME_FRONTEND = "habit-tracker-frontend:latest"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Test (Maven)') {
            steps {
                dir('backend') {
                    sh 'mvn clean test'
                }
            }
        }

        stage('Backend Package (Maven)') {
            steps {
                dir('backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Validate Docker Compose') {
            steps {
                sh 'docker compose config'
            }
        }

        // ✅ FIXED: Removed minikube docker-env TLS issue
        stage('Build Docker Images') {
            steps {
                sh '''
                docker build -t $IMAGE_NAME_BACKEND .
                docker build -t $IMAGE_NAME_FRONTEND ./frontend
                '''
            }
        }

        // Optional: push to Docker Hub (recommended)
        // Uncomment if needed
        /*
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker push $IMAGE_NAME_BACKEND
                    docker push $IMAGE_NAME_FRONTEND
                    '''
                }
            }
        }
        */

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                kubectl apply -f k8s/
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh 'kubectl get pods'
                sh 'kubectl get services'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully 🚀'
        }
        failure {
            echo 'Pipeline failed ❌'
        }
    }
}