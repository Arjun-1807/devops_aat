output "namespace" {
  value = kubernetes_manifest.namespace.manifest.metadata.name
}

output "backend_service_name" {
  value = kubernetes_manifest.backend_service.manifest.metadata.name
}
