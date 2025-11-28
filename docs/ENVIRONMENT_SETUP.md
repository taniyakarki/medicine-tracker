# Environment Setup

## Node.js and npm Version Requirements

This project requires specific versions of Node.js and npm to ensure consistent behavior across all development environments.

### Required Versions

- **Node.js**: >= 18.0.0 and < 23.0.0
- **npm**: >= 9.0.0
- **Recommended**: Node.js 22.20.0 with npm 10.9.3

### Version Locking Files

The project includes several files to lock and enforce version requirements:

#### 1. `package.json` - Engine Specifications

```json
{
  "engines": {
    "node": ">=18.0.0 <23.0.0",
    "npm": ">=9.0.0"
  }
}
```

This specifies the required Node.js and npm versions. With `engine-strict=true` in `.npmrc`, npm will fail if versions don't match.

#### 2. `.nvmrc` - Node Version Manager

```
22.20.0
```

If you use [nvm](https://github.com/nvm-sh/nvm), simply run:

```bash
nvm use
```

This will automatically switch to the correct Node.js version.

#### 3. `.npmrc` - npm Configuration

```ini
save-exact=true        # Install exact versions (no ^ or ~)
package-lock=true      # Always use package-lock.json
engine-strict=true     # Fail if Node/npm version doesn't match
save-prefix=           # Don't add version prefixes
audit-level=moderate   # Security audit level
```

### Setup Instructions

#### Using nvm (Recommended)

1. **Install nvm** (if not already installed):
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

2. **Install the required Node.js version**:
   ```bash
   nvm install
   ```

3. **Use the required version**:
   ```bash
   nvm use
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

#### Without nvm

1. **Check your Node.js version**:
   ```bash
   node --version
   ```

2. **If version doesn't match**, download and install Node.js 22.20.0:
   - Visit: https://nodejs.org/
   - Download the appropriate installer
   - Install and restart your terminal

3. **Verify npm version**:
   ```bash
   npm --version
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

### Verification

After setup, verify everything is correct:

```bash
# Check Node.js version
node --version
# Should output: v22.20.0 (or any version >= 18.0.0 and < 23.0.0)

# Check npm version
npm --version
# Should output: 10.9.3 (or any version >= 9.0.0)

# Verify package installation
npm list --depth=0
# Should show all dependencies without errors
```

### Why Version Locking?

1. **Consistency**: Ensures all developers use compatible versions
2. **Reproducibility**: Same versions = same behavior
3. **Stability**: Prevents issues from version mismatches
4. **Security**: Controlled updates with audit checks
5. **CI/CD**: Consistent builds in deployment pipelines

### Troubleshooting

#### Error: "Unsupported engine"

```
npm ERR! engine Unsupported engine
npm ERR! engine Not compatible with your version of node/npm
```

**Solution**: Install the correct Node.js version (see setup instructions above)

#### Error: "package-lock.json conflicts"

```
npm ERR! code EEXIST
npm ERR! EEXIST: file already exists
```

**Solution**: 
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Different versions on different machines

**Solution**: 
1. Ensure `.nvmrc` is committed to git
2. Run `nvm use` on each machine
3. Delete `node_modules` and reinstall

### CI/CD Configuration

For GitHub Actions, use:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v3
  with:
    node-version-file: '.nvmrc'
    cache: 'npm'

- name: Install dependencies
  run: npm ci
```

For other CI systems, read the Node.js version from `.nvmrc`:

```bash
NODE_VERSION=$(cat .nvmrc)
# Use $NODE_VERSION in your CI configuration
```

### Updating Versions

When updating Node.js or npm versions:

1. **Update `.nvmrc`**:
   ```bash
   echo "22.20.0" > .nvmrc
   ```

2. **Update `package.json` engines**:
   ```json
   "engines": {
     "node": ">=18.0.0 <23.0.0",
     "npm": ">=9.0.0"
   }
   ```

3. **Test thoroughly**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run lint
   npm start
   ```

4. **Commit changes**:
   ```bash
   git add .nvmrc package.json package-lock.json
   git commit -m "chore: update Node.js version to X.X.X"
   ```

### Additional Resources

- [Node.js Releases](https://nodejs.org/en/about/releases/)
- [npm Documentation](https://docs.npmjs.com/)
- [nvm Documentation](https://github.com/nvm-sh/nvm)
- [Expo Requirements](https://docs.expo.dev/get-started/installation/)

