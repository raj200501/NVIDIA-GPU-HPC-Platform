import subprocess
import time
import yaml

class KubernetesManager:
    def __init__(self, config_path='k8s_config.yaml'):
        with open(config_path, 'r') as file:
            self.config = yaml.safe_load(file)

    def create_namespace(self, namespace):
        subprocess.run(["kubectl", "create", "namespace", namespace])

    def apply_manifest(self, manifest_path):
        subprocess.run(["kubectl", "apply", "-f", manifest_path])

    def create_deployment(self, namespace, deployment_name, image, replicas=1, port=80):
        deployment = {
            'apiVersion': 'apps/v1',
            'kind': 'Deployment',
            'metadata': {'name': deployment_name, 'namespace': namespace},
            'spec': {
                'replicas': replicas,
                'selector': {'matchLabels': {'app': deployment_name}},
                'template': {
                    'metadata': {'labels': {'app': deployment_name}},
                    'spec': {
                        'containers': [{
                            'name': deployment_name,
                            'image': image,
                            'ports': [{'containerPort': port}]
                        }]
                    }
                }
            }
        }
        with open(f"{deployment_name}_deployment.yaml", 'w') as file:
            yaml.dump(deployment, file)
        self.apply_manifest(f"{deployment_name}_deployment.yaml")

    def create_service(self, namespace, service_name, selector, port, target_port):
        service = {
            'apiVersion': 'v1',
            'kind': 'Service',
            'metadata': {'name': service_name, 'namespace': namespace},
            'spec': {
                'selector': {'app': selector},
                'ports': [{
                    'protocol': 'TCP',
                    'port': port,
                    'targetPort': target_port
                }]
            }
        }
        with open(f"{service_name}_service.yaml", 'w') as file:
            yaml.dump(service, file)
        self.apply_manifest(f"{service_name}_service.yaml")

    def scale_deployment(self, namespace, deployment_name, replicas):
        subprocess.run(["kubectl", "scale", f"--replicas={replicas}", f"deployment/{deployment_name}", "-n", namespace])

    def delete_namespace(self, namespace):
        subprocess.run(["kubectl", "delete", "namespace", namespace])

    def monitor_pods(self, namespace):
        while True:
            subprocess.run(["kubectl", "get", "pods", "-n", namespace])
            time.sleep(10)

if __name__ == "__main__":
    k8s_manager = KubernetesManager()
    namespace = 'edge-computing'
    
    k8s_manager.create_namespace(namespace)
    
    k8s_manager.create_deployment(namespace, 'sensor-data-producer', 'sensor-data-producer:latest', replicas=3, port=8080)
    k8s_manager.create_deployment(namespace, 'data-transformer', 'data-transformer:latest', replicas=3, port=8081)
    k8s_manager.create_deployment(namespace, 'data-visualizer', 'data-visualizer:latest', replicas=2, port=8082)
    
    k8s_manager.create_service(namespace, 'sensor-data-producer-service', 'sensor-data-producer', 8080, 8080)
    k8s_manager.create_service(namespace, 'data-transformer-service', 'data-transformer', 8081, 8081)
    k8s_manager.create_service(namespace, 'data-visualizer-service', 'data-visualizer', 8082, 8082)
    
    k8s_manager.scale_deployment(namespace, 'sensor-data-producer', replicas=5)
    
    k8s_manager.monitor_pods(namespace)
    
    k8s_manager.delete_namespace(namespace)
