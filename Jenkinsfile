pipeline {
  agent any

  tools {
    jdk 'jdk17'
    maven 'maven3'
  }

  environment {
    K8S_NAMESPACE = 'habit-tracker'
    FRONTEND_SERVICE = 'habit-frontend'
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

    stage('Build Docker Images In Minikube') {
      steps {
        sh '''
          eval $(minikube -p minikube docker-env)
          docker build -t habit-tracker-backend:latest .
          docker build -t habit-tracker-frontend:latest frontend
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

    stage('Open Frontend In Browser') {
      steps {
        sh '''
          FRONTEND_URL=$(minikube service $FRONTEND_SERVICE -n $K8S_NAMESPACE --url)
          echo "Frontend is available at: $FRONTEND_URL"
          xdg-open "$FRONTEND_URL" || open "$FRONTEND_URL" || true
        '''
      }
    }
  }
}
