# Contributing to NVIDIA-GPU-HPC-Platform

We welcome contributions from everyone. By participating in this project, you agree to abide by our Code of Conduct.

## How to Contribute

1. **Fork the repository**: Click the 'Fork' button on the top right of the repository page.
2. **Clone your fork**:
```bash
git clone https://github.com/your-username/NVIDIA-GPU-HPC-Platform.git
cd NVIDIA-GPU-HPC-Platform
```
### Create a branch:
```bash
git checkout -b my-feature-branch
```
### Make your changes: Add your feature or fix a bug.
### Commit your changes:
```bash
git commit -m "Description of my changes"
```
### Push to your fork:
```bash
git push origin my-feature-branch
```
### Create a pull request: Go to the original repository and click 'New Pull Request'.
## Thank you for your contributions!

## Developer Workflow

### Install Dependencies

```bash
npm install
```

### Run the Demo Stack

```bash
npm start
```

### Run Tests

```bash
npm test
node --test
```

### Run Full Verification

```bash
bash scripts/verify.sh
```

### Environment Diagnostics

```bash
bash scripts/doctor.sh
```
