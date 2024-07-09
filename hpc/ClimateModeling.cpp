#include <cuda_runtime.h>
#include <stdio.h>

__global__ void climateModelingKernel(float *temperature, float *humidity, float *precipitation, float *windSpeed, float *newTemperature, float *newHumidity, float *newPrecipitation, float *newWindSpeed, int width, int height) {
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    int idx = y * width + x;
    
    if (x < width && y < height) {
        float temp = temperature[idx];
        float hum = humidity[idx];
        float precip = precipitation[idx];
        float wind = windSpeed[idx];
        
        // Compute climate dynamics using simplified equations
        newTemperature[idx] = temp + 0.01f * hum - 0.01f * wind + 0.01f * precip;
        newHumidity[idx] = hum + 0.01f * temp - 0.01f * precip + 0.01f * wind;
        newPrecipitation[idx] = precip + 0.01f * temp + 0.01f * hum - 0.01f * wind;
        newWindSpeed[idx] = wind + 0.01f * temp - 0.01f * hum + 0.01f * precip;
    }
}

void climateModeling(float *temperature, float *humidity, float *precipitation, float *windSpeed, int width, int height, int numSteps) {
    float *d_temperature, *d_humidity, *d_precipitation, *d_windSpeed;
    float *d_newTemperature, *d_newHumidity, *d_newPrecipitation, *d_newWindSpeed;
    cudaMalloc(&d_temperature, width * height * sizeof(float));
    cudaMalloc(&d_humidity, width * height * sizeof(float));
    cudaMalloc(&d_precipitation, width * height * sizeof(float));
    cudaMalloc(&d_windSpeed, width * height * sizeof(float));
    cudaMalloc(&d_newTemperature, width * height * sizeof(float));
    cudaMalloc(&d_newHumidity, width * height * sizeof(float));
    cudaMalloc(&d_newPrecipitation, width * height * sizeof(float));
    cudaMalloc(&d_newWindSpeed, width * height * sizeof(float));
    
    cudaMemcpy(d_temperature, temperature, width * height * sizeof(float), cudaMemcpyHostToDevice);
    cudaMemcpy(d_humidity, humidity, width * height * sizeof(float), cudaMemcpyHostToDevice);
    cudaMemcpy(d_precipitation, precipitation, width * height * sizeof(float), cudaMemcpyHostToDevice);
    cudaMemcpy(d_windSpeed, windSpeed, width * height * sizeof(float), cudaMemcpyHostToDevice);

    dim3 blockSize(16, 16);
    dim3 numBlocks((width + blockSize.x - 1) / blockSize.x, (height + blockSize.y - 1) / blockSize.y);
    
    for (int step = 0; step < numSteps; step++) {
        climateModelingKernel<<<numBlocks, blockSize>>>(d_temperature, d_humidity, d_precipitation, d_windSpeed, d_newTemperature, d_newHumidity, d_newPrecipitation, d_newWindSpeed, width, height);
        cudaDeviceSynchronize();
        cudaMemcpy(d_temperature, d_newTemperature, width * height * sizeof(float), cudaMemcpyDeviceToDevice);
        cudaMemcpy(d_humidity, d_newHumidity, width * height * sizeof(float), cudaMemcpyDeviceToDevice);
        cudaMemcpy(d_precipitation, d_newPrecipitation, width * height * sizeof(float), cudaMemcpyDeviceToDevice);
        cudaMemcpy(d_windSpeed, d_newWindSpeed, width * height * sizeof(float), cudaMemcpyDeviceToDevice);
    }
    
    cudaMemcpy(temperature, d_temperature, width * height * sizeof(float), cudaMemcpyDeviceToHost);
    cudaMemcpy(humidity, d_humidity, width * height * sizeof(float), cudaMemcpyDeviceToHost);
    cudaMemcpy(precipitation, d_precipitation, width * height * sizeof(float), cudaMemcpyDeviceToHost);
    cudaMemcpy(windSpeed, d_windSpeed, width * height * sizeof(float), cudaMemcpyDeviceToHost);
    
    cudaFree(d_temperature);
    cudaFree(d_humidity);
    cudaFree(d_precipitation);
    cudaFree(d_windSpeed);
    cudaFree(d_newTemperature);
    cudaFree(d_newHumidity);
    cudaFree(d_newPrecipitation);
    cudaFree(d_newWindSpeed);
}

void initializeClimate(float *temperature, float *humidity, float *precipitation, float *windSpeed, int width, int height) {
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            int idx = y * width + x;
            temperature[idx] = static_cast<float>(rand()) / RAND_MAX * 30.0f + 273.15f; // Temperature in Kelvin
            humidity[idx] = static_cast<float>(rand()) / RAND_MAX * 100.0f; // Humidity in percentage
            precipitation[idx] = static_cast<float>(rand()) / RAND_MAX * 10.0f; // Precipitation in mm
            windSpeed[idx] = static_cast<float>(rand()) / RAND_MAX * 20.0f; // Wind speed in m/s
        }
    }
}

int main() {
    const int width = 512;
    const int height = 512;
    const int numSteps = 1000;
    float *temperature = (float*)malloc(width * height * sizeof(float));
    float *humidity = (float*)malloc(width * height * sizeof(float));
    float *precipitation = (float*)malloc(width * height * sizeof(float));
    float *windSpeed = (float*)malloc(width * height * sizeof(float));

    initializeClimate(temperature, humidity, precipitation, windSpeed, width, height);
    climateModeling(temperature, humidity, precipitation, windSpeed, width, height, numSteps);
    
    // Output final climate state
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            int idx = y * width + x;
            printf("Cell (%d, %d): Temperature = %f K, Humidity = %f %%, Precipitation = %f mm, Wind Speed = %f m/s\n", x, y, temperature[idx], humidity[idx], precipitation[idx], windSpeed[idx]);
        }
    }
    
    free(temperature);
    free(humidity);
    free(precipitation);
    free(windSpeed);
    return 0;
}
