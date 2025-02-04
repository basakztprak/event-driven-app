# Event-Driven Application 

## Overview
This project is an Event-Driven Application that integrates Kubernetes, Kafka, MongoDB, and Node.js. It consists of:

1. **Producer Service**: Publishes events to Kafka every 3 seconds.
2. **Consumer Service**: Listens to Kafka topics and stores the data in MongoDB.
3. **API Service**: Exposes REST endpoints for querying stored events.
4. **Infrastructure**: Deployable via Helm charts, with Terraform used to provision the Kubernetes cluster.
5. **Metrics**: Prometheus-compatible metrics endpoints are available for monitoring.

## Prerequisites
- [Docker](https://www.docker.com/)
- [Minikube](https://minikube.sigs.k8s.io/docs/)
- [Terraform](https://developer.hashicorp.com/terraform/downloads)
- [Helm](https://helm.sh/)
- [Kubectl](https://kubernetes.io/docs/tasks/tools/)

## Terraform - Provision Minikube Cluster
This project uses Terraform to set up a Minikube cluster.

```sh
cd terraform
terraform init
terraform plan
terraform apply
```

## Deploy Kafka, MongoDB, and Prometheus using Helm

### Add Helm Repositories
```sh
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add rhcharts https://ricardo-aires.github.io/helm-charts/
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

### Install MongoDB
```sh
helm install my-mongodb bitnami/mongodb
```
Retrieve the MongoDB root password:
```sh
kubectl get secret my-mongodb -o jsonpath='{.data.mongodb-root-password}' | base64 --decode
```
Update `values.yaml` with the decoded password in the MongoDB URI.

### Install Kafka
```sh
helm upgrade --install my-kafka rhcharts/kafka
```

### Install Prometheus
```sh
helm install my-prometheus prometheus-community/prometheus --values helm/prometheus-values.yaml
```

## Deploy Event-Driven Application
```sh
cd helm
helm install my-event-driven-app . --values values.yaml
```

## Accessing the API
Use `kubectl port-forward` to access the API endpoint:
```sh
kubectl port-forward <api-pod-name> 3000:3000
```
Now, you can test the API with:
```sh
curl http://localhost:3000/events
curl http://localhost:3000/metrics
```
Alternatively, get the Minikube service URL:
```sh
minikube service <api-service-name> --url
```
Append `/events` to the URL to access stored events.

## Metrics Endpoints
Each service exposes Prometheus-compatible metrics:

### API Service
```sh
kubectl port-forward <api-pod-name> 3000:3000
curl http://localhost:3000/metrics
```

### Producer Service
```sh
kubectl port-forward <producer-pod-name> 3001:3000
curl http://localhost:3001/producer/metrics
```

### Consumer Service
```sh
kubectl port-forward <consumer-pod-name> 3002:3000
curl http://localhost:3002/consumer/metrics
```

## Running Locally with Docker Compose
For local development, use Docker Compose:
```sh
cd event-driven
docker-compose up --build
```
Test the API:
```sh
curl http://localhost:3000/events
```

## Additional Features
- **Retries & Dead-Letter Queues**: The Kafka consumer implements retries and sends failed messages to a `dead-letter-events` topic.
- **Scalability**: Kubernetes allows horizontal scaling of services.
- **Security**: Sensitive credentials are stored in Kubernetes Secrets.

## Challenges & Solutions
1. **Secret Management**: Managed MongoDB credentials using Kubernetes Secrets.
2. **Service Discovery**: Used Helm charts to define proper service configurations.
3. **Observability**: Integrated Prometheus for monitoring and exposing metrics.

---
This concludes the setup and deployment guide for the Event-Driven Application. Happy coding!

