document.addEventListener('DOMContentLoaded', function() {
    // Create loading content elements
    const loadingOverlay = document.querySelector('.loading-overlay');
    
    // Create loading content container
    const loadingContent = document.createElement('div');
    loadingContent.className = 'loading-content';
    
    // Get the existing spinner
    const loadingSpinner = document.querySelector('.loading-spinner');
    
    // Remove spinner from its current position
    loadingSpinner.parentNode.removeChild(loadingSpinner);
    
    // Add spinner to the content container
    loadingContent.appendChild(loadingSpinner);
    
    // Get the existing loading text
    const loadingText = document.querySelector('.loading-text');
    
    // Remove loading text from its current position
    if (loadingText) {
        loadingText.parentNode.removeChild(loadingText);
        // Add loading text to the content container
        loadingContent.appendChild(loadingText);
    } else {
        // Create loading text if it doesn't exist
        const newLoadingText = document.createElement('div');
        newLoadingText.className = 'loading-text';
        newLoadingText.textContent = 'GreenGlobeHerbs';
        loadingContent.appendChild(newLoadingText);
    }
    
    // Create progress container
    const progressContainer = document.createElement('div');
    progressContainer.className = 'loading-progress';
    loadingContent.appendChild(progressContainer);
    
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressContainer.appendChild(progressBar);
    
    // Create loading status
    const loadingStatus = document.createElement('div');
    loadingStatus.className = 'loading-status';
    loadingStatus.textContent = 'Loading resources...';
    loadingContent.appendChild(loadingStatus);
    
    // Add content to overlay
    loadingOverlay.appendChild(loadingContent);
    
    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(function() {
        progress += Math.random() * 10;
        if (progress > 100) progress = 100;
        
        progressBar.style.width = progress + '%';
        
        // Update loading status text based on progress
        if (progress < 30) {
            loadingStatus.textContent = 'Loading resources...';
        } else if (progress < 60) {
            loadingStatus.textContent = 'Preparing content...';
        } else if (progress < 90) {
            loadingStatus.textContent = 'Almost ready...';
        } else {
            loadingStatus.textContent = 'Welcome to GreenGlobeHerbs!';
        }
        
        // Make sure the loading status element is visible
        loadingStatus.style.display = 'block';
        
        if (progress === 100) {
            clearInterval(progressInterval);
        }
    }, 150);
    
    // Handle page load completion
    window.addEventListener('load', function() {
        // Ensure progress reaches 100%
        setTimeout(function() {
            progress = 100;
            progressBar.style.width = '100%';
            loadingStatus.textContent = 'Welcome to GreenGlobeHerbs!';
            
            // Fade out the loading overlay
            setTimeout(function() {
                loadingOverlay.classList.add('fade-out');
                setTimeout(function() {
                    loadingOverlay.style.display = 'none';
                }, 800);
            }, 500);
        }, 1000);
    });
});
