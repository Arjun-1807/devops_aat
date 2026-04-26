pipeline {
  agent any

  tools {
    jdk 'jdk17'
    maven 'maven3'
  }

  environment {
    K8S_NAMESPACE = 'habit-tracker'
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

    stage('Build Docker Image In Minikube') {
      steps {
        sh '''
          eval $(minikube -p minikube docker-env)
          docker build -t habit-tracker-backend:latest .
        '''
      }
    }

    stage('Deploy To Kubernetes') {
      steps {
        sh '''
          kubectl apply -f k8s/app.yaml
          kubectl rollout restart deployment/habit-backend -n $K8S_NAMESPACE || true
          kubectl rollout status deployment/habit-db -n $K8S_NAMESPACE --timeout=180s
          kubectl rollout status deployment/habit-backend -n $K8S_NAMESPACE --timeout=180s
        '''
      }
    }
  }
}
