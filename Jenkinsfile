pipeline {
    agent any

    tools {
        jdk 'jdk17'
        maven 'maven3'
    }

    environment {
        BACKEND_IMAGE = "habit-backend:latest"
        FRONTEND_IMAGE = "habit-frontend:latest"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Build & Package') {
            steps {
                dir('backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                echo "🔨 Building Docker Images..."
                docker build -t $BACKEND_IMAGE .
                docker build -t $FRONTEND_IMAGE ./frontend
                '''
            }
        }

        stage('Load Images into Minikube') {
            steps {
                sh '''
                echo "📦 Loading images into Minikube..."
                minikube image load $BACKEND_IMAGE
                minikube image load $FRONTEND_IMAGE
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                echo "🚀 Deploying to Kubernetes..."
                kubectl apply -f k8s/
                '''
            }
        }

        stage('Wait for Pods') {
            steps {
                sh '''
                echo "⏳ Waiting for pods to be ready..."
                kubectl wait --for=condition=ready pod --all --timeout=120s
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                echo "📊 Pods:"
                kubectl get pods

                echo "📊 Services:"
                kubectl get svc
                '''
            }
        }

        stage('Get Frontend URL') {
            steps {
                sh '''
                echo "🌐 Fetching Frontend URL..."

                # Get Minikube IP
                MINIKUBE_IP=$(minikube ip)

                # Get NodePort of frontend service
                NODE_PORT=$(kubectl get svc habit-frontend -o=jsonpath='{.spec.ports[0].nodePort}')

                echo "---------------------------------------"
                echo "✅ FRONTEND URL:"
                echo "http://$MINIKUBE_IP:$NODE_PORT"
                echo "---------------------------------------"
                '''
            }
        }

        stage('Open Frontend (Optional)') {
            steps {
                sh '''
                echo "🌍 Trying to open frontend in browser..."

                MINIKUBE_IP=$(minikube ip)
                NODE_PORT=$(kubectl get svc habit-frontend -o=jsonpath='{.spec.ports[0].nodePort}')

                # Try opening (may not work on headless Jenkins)
                xdg-open http://$MINIKUBE_IP:$NODE_PORT || true
                '''
            }
        }
    }

    post {
        success {
            echo '🎉 Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}