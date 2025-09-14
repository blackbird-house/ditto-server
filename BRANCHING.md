# Git Branching Strategy

This project follows a **Git Flow** branching strategy with three main branches:

## 🌿 Branch Structure

### **`develop`** - Development Branch
- **Purpose**: Active development and feature integration
- **Usage**: All new features and bug fixes are developed here first
- **Environment**: Maps to development environment
- **Deployment**: Auto-deploys to development environment

### **`staging`** - Pre-Production Branch
- **Purpose**: Pre-production testing and validation
- **Usage**: Features are promoted from `develop` when ready for testing
- **Environment**: Maps to staging environment
- **Deployment**: Auto-deploys to staging environment

### **`main`** - Production Branch
- **Purpose**: Production-ready code
- **Usage**: Releases are promoted from `staging` when ready for production
- **Environment**: Maps to production environment
- **Deployment**: Auto-deploys to production environment

## 🔄 Workflow

### **Development Flow:**
```
develop → staging → main
```

### **Step-by-Step Process:**

1. **Feature Development:**
   ```bash
   git checkout develop
   git pull origin develop
   # Make changes
   git add .
   git commit -m "feat: add new feature"
   git push origin develop
   ```

2. **Promote to Staging:**
   ```bash
   git checkout staging
   git pull origin staging
   git merge develop
   git push origin staging
   ```

3. **Create Release:**
   ```bash
   git checkout main
   git pull origin main
   git merge staging
   git tag v1.0.0
   git push origin main --tags
   ```

## 🛡️ Branch Protection Rules

### **Recommended GitHub Settings:**

#### **`main` Branch:**
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Restrict pushes that create files larger than 100MB

#### **`staging` Branch:**
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging

#### **`develop` Branch:**
- ✅ Require status checks to pass before merging
- ✅ Allow force pushes (for development flexibility)

## 🚀 Deployment Strategy

### **Environment Mapping:**
- **`develop`** → Development Environment (unreliable, for testing)
- **`staging`** → Staging Environment (stable, pre-production)
- **`main`** → Production Environment (customer-facing)

### **Deployment Commands:**
```bash
# Deploy to development
git checkout develop
yarn dev

# Deploy to staging
git checkout staging
yarn staging

# Deploy to production
git checkout main
yarn start
```

## 📋 Best Practices

### **Commit Messages:**
- Use conventional commits: `feat:`, `fix:`, `docs:`, `test:`, etc.
- Be descriptive and clear
- Reference issues when applicable

### **Pull Requests:**
- Always create PRs for `develop` → `staging` and `staging` → `main`
- Include detailed descriptions
- Ensure all tests pass
- Request code reviews

### **Testing:**
- All tests must pass before merging
- Run `yarn test:coverage` to ensure good coverage
- Test in appropriate environment before promotion

## 🔧 Quick Commands

### **Branch Management:**
```bash
# Switch to develop
git checkout develop

# Switch to staging
git checkout staging

# Switch to main
git checkout main

# See all branches
git branch -a

# Create feature branch from develop
git checkout develop
git checkout -b feature/new-feature
```

### **Promotion Commands:**
```bash
# Promote develop to staging
git checkout staging && git merge develop && git push origin staging

# Promote staging to main
git checkout main && git merge staging && git push origin main
```

## 📊 Branch Status

- **Current Active Branch**: `develop`
- **Last Release**: v1.0.0 (TypeScript conversion)
- **Next Release**: TBD
