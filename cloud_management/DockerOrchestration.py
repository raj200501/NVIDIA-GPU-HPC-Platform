import docker
import time

class DockerOrchestrator:
    def __init__(self):
        self.client = docker.from_env()

    def build_image(self, path, tag):
        self.client.images.build(path=path, tag=tag)
        print(f"Built image {tag}")

    def run_container(self, image, name, ports=None, volumes=None, environment=None, detach=True):
        container = self.client.containers.run(
            image, name=name, ports=ports, volumes=volumes, environment=environment, detach=detach
        )
        print(f"Started container {name}")
        return container

    def list_containers(self, all=True):
        containers = self.client.containers.list(all=all)
        for container in containers:
            print(f"Container {container.name} ({container.id}) - Status: {container.status}")

    def stop_container(self, container_id):
        container = self.client.containers.get(container_id)
        container.stop()
        print(f"Stopped container {container_id}")

    def remove_container(self, container_id):
        container = self.client.containers.get(container_id)
        container.remove()
        print(f"Removed container {container_id}")

    def monitor_containers(self, interval=10):
        try:
            while True:
                self.list_containers()
                time.sleep(interval)
        except KeyboardInterrupt:
            print("Monitoring stopped")

if __name__ == "__main__":
    orchestrator = DockerOrchestrator()
    
    orchestrator.build_image('path/to/sensor-data-producer', 'sensor-data-producer:latest')
    orchestrator.build_image('path/to/data-transformer', 'data-transformer:latest')
    orchestrator.build_image('path/to/data-visualizer', 'data-visualizer:latest')
    
    orchestrator.run_container('sensor-data-producer:latest', 'sensor-data-producer', ports={'8080/tcp': 8080})
    orchestrator.run_container('data-transformer:latest', 'data-transformer', ports={'8081/tcp': 8081})
    orchestrator.run_container('data-visualizer:latest', 'data-visualizer', ports={'8082/tcp': 8082})
    
    orchestrator.monitor_containers()
    
    orchestrator.stop_container('sensor-data-producer')
    orchestrator.stop_container('data-transformer')
    orchestrator.stop_container('data-visualizer')
    
    orchestrator.remove_container('sensor-data-producer')
    orchestrator.remove_container('data-transformer')
    orchestrator.remove_container('data-visualizer')
