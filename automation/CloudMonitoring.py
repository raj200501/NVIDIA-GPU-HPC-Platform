import subprocess
import time

class CloudMonitor:
    def __init__(self, interval=60):
        self.interval = interval

    def get_vm_metrics(self, instance_name, zone):
        result = subprocess.run([
            "gcloud", "compute", "instances", "describe", instance_name,
            "--zone", zone, "--format", "json"
        ], capture_output=True, text=True)
        return result.stdout

    def get_bucket_metrics(self, bucket_name):
        result = subprocess.run([
            "gsutil", "du", "-s", f"gs://{bucket_name}/"
        ], capture_output=True, text=True)
        return result.stdout

    def monitor(self, instance_name, zone, bucket_name):
        while True:
            vm_metrics = self.get_vm_metrics(instance_name, zone)
            bucket_metrics = self.get_bucket_metrics(bucket_name)
            print(f"VM Metrics: {vm_metrics}")
            print(f"Bucket Metrics: {bucket_metrics}")
            time.sleep(self.interval)

if __name__ == "__main__":
    monitor = CloudMonitor(interval=30)
    monitor.monitor('example-instance', 'us-central1-a', 'example-bucket')
