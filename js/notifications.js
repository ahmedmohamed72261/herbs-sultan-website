// Notification system for the dashboard
function showNotification(message, type = "success") {
  // Create notification element if it doesn't exist
  let notification = document.querySelector(".notification");

  if (!notification) {
    notification = document.createElement("div");
    notification.className = "notification";
    document.body.appendChild(notification);

    // Add base styles
    notification.style.position = "fixed";
    notification.style.bottom = "20px";
    notification.style.right = "20px";
    notification.style.color = "white";
    notification.style.padding = "12px 20px";
    notification.style.borderRadius = "4px";
    notification.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
    notification.style.zIndex = "9999";
    notification.style.transition = "all 0.3s ease";
    notification.style.transform = "translateY(100px)";
    notification.style.opacity = "0";
    notification.style.display = "flex";
    notification.style.alignItems = "center";
    notification.style.gap = "10px";
  }

  // Set background color based on type
  if (type === "error") {
    notification.style.backgroundColor = "#f44336";
  } else if (type === "warning") {
    notification.style.backgroundColor = "#ff9800";
  } else {
    notification.style.backgroundColor = "#4caf50";
  }

  // Set message with icon
  let icon =
    type === "error"
      ? "exclamation-circle"
      : type === "warning"
      ? "exclamation-triangle"
      : "check-circle";

  notification.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${message}</span>
  `;

  // Show notification
  setTimeout(() => {
    notification.style.transform = "translateY(0)";
    notification.style.opacity = "1";
  }, 10);

  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateY(100px)";
    notification.style.opacity = "0";
  }, 3000);
}

// Export the function
window.showNotification = showNotification;