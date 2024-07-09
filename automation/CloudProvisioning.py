import subprocess
import time
import yaml

class CloudProvisioner:
    def __init__(self, config_path='cloud_config.yaml'):
        with open(config_path, 'r') as file:
            self.config = yaml.safe_load(file)

    def create_vm_instance(self, instance_name):
        instance_config = self.config['instances'][instance_name]
        subprocess.run([
            "gcloud", "compute", "instances", "create", instance_name,
            "--zone", instance_config['zone'],
            "--machine-type", instance_config['machine_type'],
            "--image", instance_config['image'],
            "--image-project", instance_config['image_project'],
            "--tags", ",".join(instance_config['tags']),
            "--metadata", f"startup-script={instance_config['startup_script']}"
        ])
        print(f"Created VM instance {instance_name}")

    def delete_vm_instance(self, instance_name):
        instance_config = self.config['instances'][instance_name]
        subprocess.run(["gcloud", "compute", "instances", "delete", instance_name, "--zone", instance_config['zone'], "--quiet"])
        print(f"Deleted VM instance {instance_name}")

    def list_vm_instances(self):
        subprocess.run(["gcloud", "compute", "instances", "list"])

    def create_bucket(self, bucket_name):
        bucket_config = self.config['buckets'][bucket_name]
        subprocess.run([
            "gsutil", "mb", "-p", bucket_config['project_id'],
            "-c", bucket_config['class'],
            "-l", bucket_config['location'],
            f"gs://{bucket_name}/"
        ])
        print(f"Created bucket {bucket_name}")

    def delete_bucket(self, bucket_name):
        subprocess.run(["gsutil", "rm", "-r", f"gs://{bucket_name}/"])
        print(f"Deleted bucket {bucket_name}")

    def list_buckets(self):
        subprocess.run(["gsutil", "ls"])

    def monitor_resources(self):
        while True:
            self.list_vm_instances()
            self.list_buckets()
            time.sleep(self.config['interval'])

if __name__ == "__main__":
    provisioner = CloudProvisioner()
    
    provisioner.create_vm_instance('example-instance')
    provisioner.create_bucket('example-bucket')
    
    provisioner.monitor_resources()
    
    provisioner.delete_vm_instance('example-instance')
    provisioner.delete_bucket('example-bucket')
