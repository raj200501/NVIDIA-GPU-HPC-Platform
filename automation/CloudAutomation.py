import subprocess
import time
import yaml

class CloudAutomation:
    def __init__(self, config_path='automation_config.yaml'):
        with open(config_path, 'r') as file:
            self.config = yaml.safe_load(file)

    def run_backup(self, bucket_name, instance_name):
        backup_command = self.config['backup_command']
        subprocess.run([
            "gcloud", "compute", "ssh", instance_name,
            "--command", backup_command.format(bucket_name=bucket_name)
        ])
        print(f"Backup completed for instance {instance_name} to bucket {bucket_name}")

    def run_update(self, instance_name):
        update_command = self.config['update_command']
        subprocess.run([
            "gcloud", "compute", "ssh", instance_name,
            "--command", update_command
        ])
        print(f"Update completed for instance {instance_name}")

    def run_maintenance(self):
        while True:
            for instance in self.config['instances']:
                self.run_update(instance)
                self.run_backup(self.config['bucket'], instance)
            time.sleep(self.config['interval'])

if __name__ == "__main__":
    automation = CloudAutomation()
    automation.run_maintenance()
