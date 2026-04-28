pipeline {
  agent any

  tools {
    jdk 'jdk17'
    maven 'maven3'
  }

  environment {
    K8S_NAMESPACE = 'habit-tracker'
    FRONTEND_SERVICE = 'habit-frontend'
    BACKEND_SERVICE = 'habit-backend'
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

    stage('Build Docker Images (Local Docker)') {
      steps {
        sh '''
          docker build -t habit-tracker-backend:latest .
          docker build -t habit-tracker-frontend:latest ./frontend
        '''
      }
    }

    stage('Load Images Into Minikube') {
      steps {
        sh '''
          minikube status
          minikube image load habit-tracker-backend:latest
          minikube image load habit-tracker-frontend:latest
        '''
      }
    }

    stage('Deploy To Kubernetes') {
      steps {
        sh '''
          kubectl apply -f k8s/app.yaml

          kubectl rollout restart deployment/habit-backend -n $K8S_NAMESPACE || true
          kubectl rollout restart deployment/habit-frontend -n $K8S_NAMESPACE || true

          kubectl rollout status deployment/habit-db -n $K8S_NAMESPACE --timeout=180s
          kubectl rollout status deployment/habit-backend -n $K8S_NAMESPACE --timeout=180s
          kubectl rollout status deployment/habit-frontend -n $K8S_NAMESPACE --timeout=180s
        '''
      }
    }

    stage('Verify Frontend') {
      steps {
        sh '''
          FRONTEND_URL=$(minikube service $FRONTEND_SERVICE -n $K8S_NAMESPACE --url)
          echo "Frontend URL: $FRONTEND_URL"

          kubectl run frontend-smoke-check \
            -n $K8S_NAMESPACE \
            --image=curlimages/curl:8.7.1 \
            --restart=Never \
            --rm \
            --attach \
            --command -- \
            curl -fsS http://$FRONTEND_SERVICE >/dev/null
        '''
      }
    }

    stage('Print URLs') {
      steps {
        sh '''
          FRONTEND_URL=$(minikube service $FRONTEND_SERVICE -n $K8S_NAMESPACE --url)
          BACKEND_URL=$(minikube service $BACKEND_SERVICE -n $K8S_NAMESPACE --url)

          echo ""
          echo "Application deployed successfully."
          echo "Frontend URL: $FRONTEND_URL"
          echo "Backend API URL: $BACKEND_URL/api/habits"
        '''
      }
    }
  }
}