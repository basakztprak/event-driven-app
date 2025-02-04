provider "null" {}

resource "null_resource" "minikube" {
  provisioner "local-exec" {
    command = "minikube start --cpus=4 --memory=2200"
  }
}
