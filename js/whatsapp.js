document.addEventListener('DOMContentLoaded', function() {
    // WhatsApp button animation
    const whatsappButton = document.querySelector('.whatsapp-button');
    
    if (whatsappButton) {
        // Add pulse animation every few seconds
        setInterval(function() {
            whatsappButton.classList.add('pulse');
            
            setTimeout(function() {
                whatsappButton.classList.remove('pulse');
            }, 1000);
        }, 5000);
        
        // Add tooltip functionality
        whatsappButton.setAttribute('title', 'Chat with us on WhatsApp');
    }
});
