document.addEventListener("DOMContentLoaded", function () {
  // Get all video elements and their thumbnails
  const videoCards = document.querySelectorAll(".video-card");

  // Check if we have sample videos, if not, use placeholders
  const sampleVideos = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  ];

  videoCards.forEach((card, index) => {
    const thumbnail = card.querySelector(".video-thumbnail");
    const playIcon = card.querySelector(".play-icon-wrapper");
    const video = card.querySelector(".video-player");
    const watchButton = card.querySelector(".watch-now-btn");

    // Function to handle video playback
    function handleVideoPlay() {
      // Create a fullscreen modal for the video
      const videoModal = document.createElement("div");
      videoModal.className = "video-modal";

      // Create a new video element for the modal
      const modalVideo = document.createElement("video");
      modalVideo.className = "modal-video-player";
      modalVideo.controls = true;
      modalVideo.autoplay = true;
      modalVideo.playsInline = true;

      // Add source to the video
      const source = document.createElement("source");

      // Check if we have a valid source in the original video
      const originalSource = video.querySelector("source");
      if (
        originalSource &&
        originalSource.src &&
        !originalSource.src.endsWith("/")
      ) {
        source.src = originalSource.src;
        source.type = "video/mp4";
      } else {
        // Use a sample video if no valid source is found
        source.src = sampleVideos[index % sampleVideos.length];
        source.type = "video/mp4";
      }

      modalVideo.appendChild(source);

      // Create close button
      const closeButton = document.createElement("button");
      closeButton.className = "modal-close-btn";
      closeButton.innerHTML = '<i class="fas fa-times"></i>';

      // Add elements to modal
      videoModal.appendChild(modalVideo);
      videoModal.appendChild(closeButton);

      // Add modal to body
      document.body.appendChild(videoModal);

      // Show modal with animation
      setTimeout(() => {
        videoModal.classList.add("active");

        // Try to play the video
        const playPromise = modalVideo.play();

        if (playPromise !== undefined) {
          playPromise
            .then((_) => {
              // Playback started successfully
              console.log("Video playback started");
            })
            .catch((error) => {
              // Auto-play was prevented
              console.log("Auto-play was prevented:", error);
              // Show a play button or message to the user
              const playOverlay = document.createElement("div");
              playOverlay.className = "play-overlay";
              playOverlay.innerHTML =
                '<div class="big-play-button"><i class="fas fa-play"></i></div>';
              videoModal.appendChild(playOverlay);

              playOverlay.addEventListener("click", () => {
                modalVideo.play();
                playOverlay.style.display = "none";
              });
            });
        }
      }, 10);

      // Handle close button click
      closeButton.addEventListener("click", () => {
        modalVideo.pause();
        videoModal.classList.remove("active");

        // Remove modal after animation completes
        setTimeout(() => {
          document.body.removeChild(videoModal);
        }, 300);
      });

      // Close modal on background click
      videoModal.addEventListener("click", (e) => {
        if (e.target === videoModal) {
          closeButton.click();
        }
      });

      // Close modal on escape key
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && document.querySelector(".video-modal")) {
          closeButton.click();
        }
      });
    }

    // Play video when clicking on thumbnail or play icon
    thumbnail.addEventListener("click", handleVideoPlay);

    // Play video when clicking on watch now button
    if (watchButton) {
      watchButton.addEventListener("click", handleVideoPlay);
    }

    // Also make the play icon clickable
    if (playIcon) {
      playIcon.addEventListener("click", function (e) {
        e.stopPropagation(); // Prevent triggering the thumbnail click
        handleVideoPlay();
      });
    }
  });

  // Add CSS for video modal
  const modalStyle = document.createElement("style");
  modalStyle.textContent = `
        .video-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .video-modal.active {
            opacity: 1;
        }

        .modal-video-player {
            max-width: 90%;
            max-height: 80vh;
            width: 1000px;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
            background-color: #000;
        }

        .modal-close-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            background-color: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 10000;
        }

        .modal-close-btn:hover {
            background-color: rgba(255, 255, 255, 0.4);
            transform: rotate(90deg);
        }

        .play-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(0, 0, 0, 0.3);
            cursor: pointer;
        }

        .big-play-button {
            width: 80px;
            height: 80px;
            background-color: rgba(46, 125, 50, 0.9);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 2rem;
            transition: all 0.3s ease;
        }

        .big-play-button:hover {
            transform: scale(1.1);
            background-color: #2e7d32;
        }

        @media (max-width: 768px) {
            .modal-video-player {
                width: 95%;
            }

            .modal-close-btn {
                top: 10px;
                right: 10px;
                width: 35px;
                height: 35px;
            }

            .big-play-button {
                width: 60px;
                height: 60px;
                font-size: 1.5rem;
            }
        }
    `;

  document.head.appendChild(modalStyle);
});
