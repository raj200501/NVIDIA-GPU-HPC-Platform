#include <iostream>
#include <fstream>
#include <unistd.h>
#include <fcntl.h>
#include <sys/ioctl.h>
#include <linux/i2c-dev.h>
#include <opencv2/opencv.hpp>
#include <opencv2/core.hpp>
#include <opencv2/imgproc.hpp>
#include <opencv2/highgui.hpp>

#define I2C_DEVICE "/dev/i2c-1"
#define DEVICE_ADDRESS 0x48

void setupI2C(int &file) {
    if ((file = open(I2C_DEVICE, O_RDWR)) < 0) {
        std::cerr << "Failed to open the i2c bus" << std::endl;
        exit(1);
    }

    if (ioctl(file, I2C_SLAVE, DEVICE_ADDRESS) < 0) {
        std::cerr << "Failed to acquire bus access and/or talk to slave" << std::endl;
        exit(1);
    }
}

float readTemperature(int file) {
    char buffer[2] = {0};
    if (read(file, buffer, 2) != 2) {
        std::cerr << "Failed to read from the i2c bus" << std::endl;
        exit(1);
    } else {
        int temp = (buffer[0] << 8) + buffer[1];
        return temp * 0.02 - 273.15;
    }
}

void captureAndProcessVideo() {
    cv::VideoCapture cap(0);
    if (!cap.isOpened()) {
        std::cerr << "Error: Could not open camera" << std::endl;
        exit(1);
    }

    cv::Mat frame, edges;
    while (true) {
        cap >> frame;
        if (frame.empty()) break;
        cv::cvtColor(frame, edges, cv::COLOR_BGR2GRAY);
        cv::GaussianBlur(edges, edges, cv::Size(7,7), 1.5, 1.5);
        cv::Canny(edges, edges, 0, 30, 3);
        cv::imshow("Edges", edges);
        if (cv::waitKey(30) >= 0) break;
    }
}

int main() {
    int file;
    setupI2C(file);
    
    float temperature = readTemperature(file);
    std::cout << "Current temperature: " << temperature << "°C" << std::endl;

    std::cout << "Starting video capture and processing..." << std::endl;
    captureAndProcessVideo();

    close(file);
    return 0;
}
