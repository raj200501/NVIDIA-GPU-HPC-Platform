# Usage Guide

## Accessing Services

### User Service
- **Get all users**
```bash
curl http://localhost:8080/users
```
### Get user by ID
```bash
curl http://localhost:8080/users/{id}
```
### Create a new user
```bash
curl -X POST -H "Content-Type: application/json" -d '{"name": "John Doe", "email": "john.doe@example.com", "password": "password"}' http://localhost:8080/users
```
### Auth Service
#### Login
```bash
curl -X POST -H "Content-Type: application/json" -d '{"email": "john.doe@example.com", "password": "password"}' http://localhost:8081/auth/login
```
### Register
```bash
curl -X POST -H "Content-Type: application/json" -d '{"email": "john.doe@example.com", "password": "password"}' http://localhost:8081/auth/register
```
### Payment Service
#### Get all payments
```bash
curl http://localhost:8082/payments
```
#### Create a new payment
```bash
curl -X POST -H "Content-Type: application/json" -d '{"userId": 1, "amount": 100.0}' http://localhost:8082/payments
```
### Notification Service
#### Send a notification
```bash
curl -X POST -H "Content-Type: application/json" -d '{"userId": 1, "message": "Hello, John!"}' http://localhost:8083/notifications
```
#### Get notifications for a user
```bash
curl http://localhost:8083/notifications/{userId}
```
### API Gateway
#### Proxy requests to User Service
```bash
curl http://localhost:3000/api/users
```
#### Proxy requests to Auth Service
```bash
curl http://localhost:3000/api/auth/login
```
#### Proxy requests to Payment Service
```bash
curl http://localhost:3000/api/payments
```
#### Proxy requests to Notification Service
```bash
curl http://localhost:3000/api/notifications
```
### Monitoring and Logging
Use Kubernetes and Docker commands to monitor running services and check logs.

```bash
kubectl get pods
kubectl logs {pod_name}

docker ps
docker logs {container_id}
```
