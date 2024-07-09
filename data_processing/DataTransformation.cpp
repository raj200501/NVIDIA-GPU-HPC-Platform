#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <string>
#include <algorithm>

struct SensorData {
    int sensor_id;
    float temperature;
    float humidity;
    long timestamp;
};

std::vector<SensorData> readDataFromFile(const std::string &filename) {
    std::vector<SensorData> data;
    std::ifstream file(filename);
    std::string line;

    while (std::getline(file, line)) {
        std::stringstream ss(line);
        SensorData sensorData;
        ss >> sensorData.sensor_id >> sensorData.temperature >> sensorData.humidity >> sensorData.timestamp;
        data.push_back(sensorData);
    }

    return data;
}

void transformData(std::vector<SensorData> &data) {
    std::for_each(data.begin(), data.end(), [](SensorData &sensorData) {
        sensorData.temperature = (sensorData.temperature * 9/5) + 32; // Convert Celsius to Fahrenheit
        sensorData.humidity = sensorData.humidity / 100; // Convert percentage to fraction
    });
}

void writeDataToFile(const std::string &filename, const std::vector<SensorData> &data) {
    std::ofstream file(filename);
    for (const auto &sensorData : data) {
        file << sensorData.sensor_id << " " << sensorData.temperature << " " << sensorData.humidity << " " << sensorData.timestamp << "\n";
    }
}

void printData(const std::vector<SensorData> &data) {
    for (const auto &sensorData : data) {
        std::cout << "Sensor ID: " << sensorData.sensor_id
                  << ", Temperature: " << sensorData.temperature
                  << ", Humidity: " << sensorData.humidity
                  << ", Timestamp: " << sensorData.timestamp << std::endl;
    }
}

int main() {
    std::string inputFilename = "sensor_data.txt";
    std::string outputFilename = "transformed_sensor_data.txt";

    std::vector<SensorData> data = readDataFromFile(inputFilename);

    std::cout << "Original Data:\n";
    printData(data);

    transformData(data);

    std::cout << "\nTransformed Data:\n";
    printData(data);

    writeDataToFile(outputFilename, data);

    return 0;
}
