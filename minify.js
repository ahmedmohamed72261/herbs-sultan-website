const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');
const { minify: minifyHTML } = require('html-minifier-terser');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Create subdirectories in dist
const cssDistDir = path.join(distDir, 'css');
const jsDistDir = path.join(distDir, 'js');
const assetsDistDir = path.join(distDir, 'assets');

[cssDistDir, jsDistDir, assetsDistDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Function to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Minify CSS files
async function minifyCSS() {
  const cssDir = path.join(__dirname, 'css');
  const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
  
  console.log('Minifying CSS files...');
  
  for (const file of cssFiles) {
    const inputPath = path.join(cssDir, file);
    const outputPath = path.join(cssDistDir, file);
    
    try {
      const css = fs.readFileSync(inputPath, 'utf8');
      const result = new CleanCSS({ 
        level: 2,
        returnPromise: false
      }).minify(css);
      
      if (result.errors.length > 0) {
        console.error(`Error minifying ${file}:`, result.errors);
        continue;
      }
      
      fs.writeFileSync(outputPath, result.styles);
      console.log(`✓ Minified ${file} (${css.length} → ${result.styles.length} bytes)`);
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
}

// Minify JavaScript files
async function minifyJS() {
  const jsDir = path.join(__dirname, 'js');
  const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
  
  console.log('Minifying JavaScript files...');
  
  for (const file of jsFiles) {
    const inputPath = path.join(jsDir, file);
    const outputPath = path.join(jsDistDir, file);
    
    try {
      const js = fs.readFileSync(inputPath, 'utf8');
      const result = await minify(js, {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug']
        },
        mangle: true,
        format: {
          comments: false
        }
      });
      
      if (result.error) {
        console.error(`Error minifying ${file}:`, result.error);
        continue;
      }
      
      fs.writeFileSync(outputPath, result.code);
      console.log(`✓ Minified ${file} (${js.length} → ${result.code.length} bytes)`);
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
}

// Minify HTML files
async function processHTML() {
  console.log('Minifying HTML files...');
  
  const htmlFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.html'));
  
  for (const file of htmlFiles) {
    const inputPath = path.join(__dirname, file);
    const outputPath = path.join(distDir, file);
    
    try {
      const html = fs.readFileSync(inputPath, 'utf8');
      
      const minifiedHTML = await minifyHTML(html, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: true,
        removeEmptyAttributes: true,
        removeOptionalTags: false,
        sortAttributes: true,
        sortClassName: true
      });
      
      fs.writeFileSync(outputPath, minifiedHTML);
      console.log(`✓ Minified ${file} (${html.length} → ${minifiedHTML.length} bytes)`);
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
}

// Copy assets directory
function copyAssets() {
  console.log('Copying assets...');
  
  const assetsDir = path.join(__dirname, 'assets');
  if (fs.existsSync(assetsDir)) {
    copyDir(assetsDir, assetsDistDir);
    console.log('✓ Assets copied');
  }
}

// Copy other important files
function copyOtherFiles() {
  console.log('Copying other files...');
  
  const filesToCopy = ['README.md'];
  
  filesToCopy.forEach(file => {
    const srcPath = path.join(__dirname, file);
    const destPath = path.join(distDir, file);
    
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✓ Copied ${file}`);
    }
  });
}

// Calculate total size savings
function calculateSavings() {
  console.log('\n📊 Build Statistics:');
  
  function getDirectorySize(dirPath) {
    let totalSize = 0;
    
    if (!fs.existsSync(dirPath)) return 0;
    
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dirPath, file.name);
      
      if (file.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += fs.statSync(filePath).size;
      }
    }
    
    return totalSize;
  }
  
  const originalSize = getDirectorySize(path.join(__dirname, 'css')) + 
                      getDirectorySize(path.join(__dirname, 'js')) +
                      fs.readdirSync(__dirname)
                        .filter(file => file.endsWith('.html'))
                        .reduce((size, file) => size + fs.statSync(path.join(__dirname, file)).size, 0);
  
  const minifiedSize = getDirectorySize(cssDistDir) + 
                      getDirectorySize(jsDistDir) +
                      fs.readdirSync(distDir)
                        .filter(file => file.endsWith('.html'))
                        .reduce((size, file) => size + fs.statSync(path.join(distDir, file)).size, 0);
  
  const savings = originalSize - minifiedSize;
  const percentage = ((savings / originalSize) * 100).toFixed(1);
  
  console.log(`Original size: ${(originalSize / 1024).toFixed(2)} KB`);
  console.log(`Minified size: ${(minifiedSize / 1024).toFixed(2)} KB`);
  console.log(`Savings: ${(savings / 1024).toFixed(2)} KB (${percentage}%)`);
}

// Main function
async function build() {
  console.log('🚀 Starting build process...\n');
  
  try {
    await minifyCSS();
    console.log('');
    
    await minifyJS();
    console.log('');
    
    await processHTML();
    console.log('');
    
    copyAssets();
    console.log('');
    
    copyOtherFiles();
    console.log('');
    
    calculateSavings();
    
    console.log('\n✅ Build completed successfully!');
    console.log(`📁 Minified files are in the 'dist' directory`);
    console.log(`🚀 Your project is ready for deployment!`);
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

build();