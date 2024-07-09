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
#include <opencv2/dnn.hpp>

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

float readDistanceSensor(int file) {
    char buffer[2] = {0};
    if (read(file, buffer, 2) != 2) {
        std::cerr << "Failed to read from the i2c bus" << std::endl;
        exit(1);
    } else {
        int distance = (buffer[0] << 8) + buffer[1];
        return static_cast<float>(distance) / 100.0;
    }
}

void captureAndProcessVideo(cv::dnn::Net &net) {
    cv::VideoCapture cap(0);
    if (!cap.isOpened()) {
        std::cerr << "Error: Could not open camera" << std::endl;
        exit(1);
    }

    cv::Mat frame;
    while (true) {
        cap >> frame;
        if (frame.empty()) break;

        cv::Mat blob = cv::dnn::blobFromImage(frame, 1.0, cv::Size(224, 224), cv::Scalar(104.0, 177.0, 123.0));
        net.setInput(blob);
        cv::Mat detections = net.forward();

        for (int i = 0; i < detections.size[2]; i++) {
            float confidence = detections.at<float>(0, 0, i, 2);
            if (confidence > 0.5) {
                int xLeftBottom = static_cast<int>(detections.at<float>(0, 0, i, 3) * frame.cols);
                int yLeftBottom = static_cast<int>(detections.at<float>(0, 0, i, 4) * frame.rows);
                int xRightTop = static_cast<int>(detections.at<float>(0, 0, i, 5) * frame.cols);
                int yRightTop = static_cast<int>(detections.at<float>(0, 0, i, 6) * frame.rows);
                cv::rectangle(frame, cv::Point(xLeftBottom, yLeftBottom), cv::Point(xRightTop, yRightTop), cv::Scalar(0, 255, 0));
            }
        }
        cv::imshow("Detections", frame);
        if (cv::waitKey(30) >= 0) break;
    }
}

int main() {
    int file;
    setupI2C(file);
    
    float distance = readDistanceSensor(file);
    std::cout << "Distance to obstacle: " << distance << " cm" << std::endl;

    std::cout << "Starting video capture and processing..." << std::endl;

    cv::dnn::Net net = cv::dnn::readNetFromCaffe("deploy.prototxt", "res10_300x300_ssd_iter_140000.caffemodel");
    captureAndProcessVideo(net);

    close(file);
    return 0;
}
