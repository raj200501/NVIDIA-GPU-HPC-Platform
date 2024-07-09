# Installation Guide

## Prerequisites
- Java Development Kit (JDK) 11+
- Apache Maven
- Node.js
- Python 3.8+
- Docker
- Kubernetes
- Google Cloud SDK

## Steps

### Clone the Repository
```bash
git clone https://github.com/your-username/NVIDIA-GPU-HPC-Platform.git
cd NVIDIA-GPU-HPC-Platform
```
### Set up Google Cloud SDK
Follow the official guide to install and authenticate Google Cloud SDK.

### Build the Project
#### Java Microservices
```bash
cd microservices
mvn clean package
```
### Node.js API
```bash
cd api
npm install
```
### Python Scripts
```bash
pip install -r requirements.txt
```
### Run the Services
#### Java Microservices
```bash
java -jar target/UserService-0.0.1-SNAPSHOT.jar
java -jar target/AuthService-0.0.1-SNAPSHOT.jar
java -jar target/PaymentService-0.0.1-SNAPSHOT.jar
java -jar target/NotificationService-0.0.1-SNAPSHOT.jar
```
### Node.js API
```bash
node ApiController.js
```
### Deploy with Docker
#### Build Docker Images
```bash
docker build -t user-service:latest ./microservices/user-service
docker build -t auth-service:latest ./microservices/auth-service
docker build -t payment-service:latest ./microservices/payment-service
docker build -t notification-service:latest ./microservices/notification-service
docker build -t api-gateway:latest ./api
```
### Run Docker Containers
```bash
docker run -d -p 8080:8080 user-service:latest
docker run -d -p 8081:8081 auth-service:latest
docker run -d -p 8082:8082 payment-service:latest
docker run -d -p 8083:8083 notification-service:latest
docker run -d -p 3000:3000 api-gateway:latest
```
### Kubernetes Deployment
#### Apply Kubernetes Manifests
```bash
kubectl apply -f ci_cd/KubernetesDeployment.yaml
```
### Automate with Jenkins
Set up Jenkins with the provided Jenkinsfile to automate the build and deployment process.
