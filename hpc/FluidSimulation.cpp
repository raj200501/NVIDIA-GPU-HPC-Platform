#include <cuda_runtime.h>
#include <stdio.h>

__global__ void fluidSimulationKernel(float *pressure, float *velocity, float *density, float *newPressure, float *newVelocity, float *newDensity, int width, int height) {
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    int idx = y * width + x;
    
    if (x < width && y < height) {
        float p = pressure[idx];
        float v = velocity[idx];
        float d = density[idx];
        
        // Compute new pressure, velocity, and density using Navier-Stokes equations
        newPressure[idx] = p + 0.1f * (d - p);
        newVelocity[idx] = v + 0.1f * (p - v);
        newDensity[idx] = d + 0.1f * (v - d);
    }
}

void fluidSimulation(float *pressure, float *velocity, float *density, int width, int height, int numSteps) {
    float *d_pressure, *d_velocity, *d_density, *d_newPressure, *d_newVelocity, *d_newDensity;
    cudaMalloc(&d_pressure, width * height * sizeof(float));
    cudaMalloc(&d_velocity, width * height * sizeof(float));
    cudaMalloc(&d_density, width * height * sizeof(float));
    cudaMalloc(&d_newPressure, width * height * sizeof(float));
    cudaMalloc(&d_newVelocity, width * height * sizeof(float));
    cudaMalloc(&d_newDensity, width * height * sizeof(float));
    
    cudaMemcpy(d_pressure, pressure, width * height * sizeof(float), cudaMemcpyHostToDevice);
    cudaMemcpy(d_velocity, velocity, width * height * sizeof(float), cudaMemcpyHostToDevice);
    cudaMemcpy(d_density, density, width * height * sizeof(float), cudaMemcpyHostToDevice);

    dim3 blockSize(16, 16);
    dim3 numBlocks((width + blockSize.x - 1) / blockSize.x, (height + blockSize.y - 1) / blockSize.y);
    
    for (int step = 0; step < numSteps; step++) {
        fluidSimulationKernel<<<numBlocks, blockSize>>>(d_pressure, d_velocity, d_density, d_newPressure, d_newVelocity, d_newDensity, width, height);
        cudaDeviceSynchronize();
        cudaMemcpy(d_pressure, d_newPressure, width * height * sizeof(float), cudaMemcpyDeviceToDevice);
        cudaMemcpy(d_velocity, d_newVelocity, width * height * sizeof(float), cudaMemcpyDeviceToDevice);
        cudaMemcpy(d_density, d_newDensity, width * height * sizeof(float), cudaMemcpyDeviceToDevice);
    }
    
    cudaMemcpy(pressure, d_pressure, width * height * sizeof(float), cudaMemcpyDeviceToHost);
    cudaMemcpy(velocity, d_velocity, width * height * sizeof(float), cudaMemcpyDeviceToHost);
    cudaMemcpy(density, d_density, width * height * sizeof(float), cudaMemcpyDeviceToHost);
    
    cudaFree(d_pressure);
    cudaFree(d_velocity);
    cudaFree(d_density);
    cudaFree(d_newPressure);
    cudaFree(d_newVelocity);
    cudaFree(d_newDensity);
}

void initializeFluid(float *pressure, float *velocity, float *density, int width, int height) {
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            int idx = y * width + x;
            pressure[idx] = static_cast<float>(rand()) / RAND_MAX;
            velocity[idx] = static_cast<float>(rand()) / RAND_MAX;
            density[idx] = static_cast<float>(rand()) / RAND_MAX;
        }
    }
}

int main() {
    const int width = 512;
    const int height = 512;
    const int numSteps = 1000;
    float *pressure = (float*)malloc(width * height * sizeof(float));
    float *velocity = (float*)malloc(width * height * sizeof(float));
    float *density = (float*)malloc(width * height * sizeof(float));

    initializeFluid(pressure, velocity, density, width, height);
    fluidSimulation(pressure, velocity, density, width, height, numSteps);
    
    // Output final pressure, velocity, and density
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            int idx = y * width + x;
            printf("Cell (%d, %d): Pressure = %f, Velocity = %f, Density = %f\n", x, y, pressure[idx], velocity[idx], density[idx]);
        }
    }
    
    free(pressure);
    free(velocity);
    free(density);
    return 0;
}
