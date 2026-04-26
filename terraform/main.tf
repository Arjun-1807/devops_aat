terraform {
  required_version = ">= 1.5.0"

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.33"
    }
  }
}

provider "kubernetes" {
  config_path = pathexpand(var.kubeconfig_path)
}

resource "kubernetes_manifest" "namespace" {
  manifest = yamldecode(split("---", file("${path.module}/../k8s/app.yaml"))[0])
}

resource "kubernetes_manifest" "postgres_deployment" {
  manifest   = yamldecode(split("---", file("${path.module}/../k8s/app.yaml"))[1])
  depends_on = [kubernetes_manifest.namespace]
}

resource "kubernetes_manifest" "postgres_service" {
  manifest   = yamldecode(split("---", file("${path.module}/../k8s/app.yaml"))[2])
  depends_on = [kubernetes_manifest.postgres_deployment]
}

resource "kubernetes_manifest" "backend_deployment" {
  manifest   = yamldecode(split("---", file("${path.module}/../k8s/app.yaml"))[3])
  depends_on = [kubernetes_manifest.postgres_service]
}

resource "kubernetes_manifest" "backend_service" {
  manifest   = yamldecode(split("---", file("${path.module}/../k8s/app.yaml"))[4])
  depends_on = [kubernetes_manifest.backend_deployment]
}
