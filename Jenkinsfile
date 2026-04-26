pipeline {
  agent any

  tools {
    jdk 'jdk17'
    maven 'maven3'
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

    stage('Docker Build') {
      steps {
        sh 'docker build -t habit-tracker-backend:latest .'
      }
    }
  }
}
