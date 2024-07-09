#include <cuda_runtime.h>
#include <stdio.h>
#include <math.h>

__global__ void molecularDynamicsKernel(float *positions, float *velocities, float *forces, int numAtoms) {
    int idx = threadIdx.x + blockIdx.x * blockDim.x;
    if (idx < numAtoms) {
        float pos = positions[idx];
        float vel = velocities[idx];
        float force = 0.0f;
        // Compute forces based on neighboring atoms (simplified Lennard-Jones potential)
        for (int i = 0; i < numAtoms; i++) {
            if (i != idx) {
                float r = pos - positions[i];
                float r2 = r * r;
                float r6 = r2 * r2 * r2;
                float r12 = r6 * r6;
                force += 24.0f * (2.0f / r12 - 1.0f / r6) / r2;
            }
        }
        forces[idx] = force;
        // Update positions and velocities using Verlet integration
        float newVel = vel + 0.5f * force;
        positions[idx] = pos + newVel;
        velocities[idx] = newVel + 0.5f * force;
    }
}

void molecularDynamics(float *positions, float *velocities, int numAtoms, int numSteps) {
    float *d_positions, *d_velocities, *d_forces;
    cudaMalloc(&d_positions, numAtoms * sizeof(float));
    cudaMalloc(&d_velocities, numAtoms * sizeof(float));
    cudaMalloc(&d_forces, numAtoms * sizeof(float));
    cudaMemcpy(d_positions, positions, numAtoms * sizeof(float), cudaMemcpyHostToDevice);
    cudaMemcpy(d_velocities, velocities, numAtoms * sizeof(float), cudaMemcpyHostToDevice);

    int blockSize = 256;
    int numBlocks = (numAtoms + blockSize - 1) / blockSize;
    
    for (int step = 0; step < numSteps; step++) {
        molecularDynamicsKernel<<<numBlocks, blockSize>>>(d_positions, d_velocities, d_forces, numAtoms);
        cudaDeviceSynchronize();
    }
    
    cudaMemcpy(positions, d_positions, numAtoms * sizeof(float), cudaMemcpyDeviceToHost);
    cudaMemcpy(velocities, d_velocities, numAtoms * sizeof(float), cudaMemcpyDeviceToHost);
    cudaFree(d_positions);
    cudaFree(d_velocities);
    cudaFree(d_forces);
}

void initializeAtoms(float *positions, float *velocities, int numAtoms) {
    for (int i = 0; i < numAtoms; i++) {
        positions[i] = static_cast<float>(rand()) / RAND_MAX;
        velocities[i] = 0.0f;
    }
}

int main() {
    const int numAtoms = 1000;
    const int numSteps = 10000;
    float *positions = (float*)malloc(numAtoms * sizeof(float));
    float *velocities = (float*)malloc(numAtoms * sizeof(float));

    initializeAtoms(positions, velocities, numAtoms);
    molecularDynamics(positions, velocities, numAtoms, numSteps);
    
    // Output final positions and velocities
    for (int i = 0; i < numAtoms; i++) {
        printf("Atom %d: Position = %f, Velocity = %f\n", i, positions[i], velocities[i]);
    }
    
    free(positions);
    free(velocities);
    return 0;
}
