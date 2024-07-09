import time
import threading
from kafka import KafkaProducer, KafkaConsumer
import json
import random

# Constants
KAFKA_TOPIC = 'sensor_data'
KAFKA_BROKER = 'localhost:9092'

def generate_sensor_data():
    while True:
        data = {
            'sensor_id': random.randint(1, 100),
            'temperature': round(random.uniform(15.0, 25.0), 2),
            'humidity': round(random.uniform(30.0, 60.0), 2),
            'timestamp': time.time()
        }
        yield data

def producer():
    producer = KafkaProducer(
        bootstrap_servers=KAFKA_BROKER,
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )
    for data in generate_sensor_data():
        producer.send(KAFKA_TOPIC, value=data)
        print(f"Produced: {data}")
        time.sleep(1)

def consumer():
    consumer = KafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=KAFKA_BROKER,
        auto_offset_reset='earliest',
        enable_auto_commit=True,
        group_id='sensor_group',
        value_serializer=lambda v: json.loads(v.decode('utf-8'))
    )
    for message in consumer:
        data = message.value
        print(f"Consumed: {data}")
        process_data(data)

def process_data(data):
    # Placeholder function to process data
    print(f"Processing data: {data}")

if __name__ == "__main__":
    producer_thread = threading.Thread(target=producer)
    consumer_thread = threading.Thread(target=consumer)

    producer_thread.start()
    consumer_thread.start()

    producer_thread.join()
    consumer_thread.join()
