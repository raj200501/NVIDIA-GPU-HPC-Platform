import psutil
import os
import subprocess
import time
import yaml

class ResourceAllocator:
    def __init__(self, config_path='resource_config.yaml'):
        with open(config_path, 'r') as file:
            self.config = yaml.safe_load(file)

    def check_cpu_usage(self):
        return psutil.cpu_percent(interval=1)

    def check_memory_usage(self):
        memory_info = psutil.virtual_memory()
        return memory_info.percent

    def allocate_resources(self):
        for resource in self.config['resources']:
            if resource['type'] == 'cpu':
                self.allocate_cpu(resource)
            elif resource['type'] == 'memory':
                self.allocate_memory(resource)

    def allocate_cpu(self, resource):
        cpu_usage = self.check_cpu_usage()
        if cpu_usage > resource['threshold']:
            print(f"CPU usage {cpu_usage}% exceeds threshold {resource['threshold']}%, scaling up")
            self.scale_up(resource)
        else:
            print(f"CPU usage {cpu_usage}% is below threshold {resource['threshold']}%, scaling down")
            self.scale_down(resource)

    def allocate_memory(self, resource):
        memory_usage = self.check_memory_usage()
        if memory_usage > resource['threshold']:
            print(f"Memory usage {memory_usage}% exceeds threshold {resource['threshold']}%, scaling up")
            self.scale_up(resource)
        else:
            print(f"Memory usage {memory_usage}% is below threshold {resource['threshold']}%, scaling down")
            self.scale_down(resource)

    def scale_up(self, resource):
        subprocess.run(["kubectl", "scale", f"--replicas={resource['scale_up_replicas']}", resource['target']])

    def scale_down(self, resource):
        subprocess.run(["kubectl", "scale", f"--replicas={resource['scale_down_replicas']}", resource['target']])

    def monitor_resources(self):
        while True:
            self.allocate_resources()
            time.sleep(self.config['interval'])

if __name__ == "__main__":
    allocator = ResourceAllocator()
    allocator.monitor_resources()
