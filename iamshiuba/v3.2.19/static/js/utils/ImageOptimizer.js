/**
 * ImageOptimizer.js
 * Handles lazy loading and responsive image optimization
 */

class ImageOptimizer {
  constructor(options = {}) {
    // Default options
    this.defaults = {
      selector: 'img[data-src]',
      threshold: 0.1,
      rootMargin: '200px',
      placeholderColor: '#e5e7eb',
      loadingClass: 'img-loading',
      loadedClass: 'img-loaded',
      errorClass: 'img-error'
    };

    // Merge options with defaults
    this.options = { ...this.defaults, ...options };
    
    // Initialize
    this.init();
  }

  /**
   * Initialize the image optimizer
   */
  init() {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      this.loadAllImages();
      return;
    }

    // Create observer
    this.observer = new IntersectionObserver(this.onIntersection.bind(this), {
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold
    });

    // Find all images with data-src attribute
    this.images = document.querySelectorAll(this.options.selector);
    
    // Apply placeholder and observe each image
    this.images.forEach(image => {
      // Add loading class
      image.classList.add(this.options.loadingClass);
      
      // Set placeholder color
      this.setPlaceholder(image);
      
      // Start observing
      this.observer.observe(image);
    });
  }

  /**
   * Set placeholder for image
   * @param {HTMLImageElement} image - Image element
   */
  setPlaceholder(image) {
    // Save original styles
    const originalStyles = {
      backgroundColor: image.style.backgroundColor,
      transition: image.style.transition
    };
    
    // Store original styles for later restoration
    image.dataset.originalStyles = JSON.stringify(originalStyles);
    
    // Apply placeholder styles
    image.style.backgroundColor = this.options.placeholderColor;
    image.style.transition = 'opacity 0.3s ease, filter 0.5s ease';
  }

  /**
   * Handle intersection of images with viewport
   * @param {IntersectionObserverEntry[]} entries - Intersection entries
   */
  onIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }

  /**
   * Load a single image
   * @param {HTMLImageElement} image - Image element to load
   */
  loadImage(image) {
    const src = image.dataset.src;
    const srcset = image.dataset.srcset;
    const sizes = image.dataset.sizes;
    
    // Create a new image to load in the background
    const img = new Image();
    
    // Set up load and error handlers
    img.onload = () => this.onImageLoaded(image, src, srcset, sizes);
    img.onerror = () => this.onImageError(image);
    
    // Start loading
    if (srcset) {
      img.srcset = srcset;
    }
    if (sizes) {
      img.sizes = sizes;
    }
    img.src = src;
  }

  /**
   * Handle successful image load
   * @param {HTMLImageElement} image - Original image element
   * @param {string} src - Source URL
   * @param {string} srcset - Source set for responsive images
   * @param {string} sizes - Sizes attribute for responsive images
   */
  onImageLoaded(image, src, srcset, sizes) {
    // Apply the loaded image attributes
    if (srcset) {
      image.srcset = srcset;
    }
    if (sizes) {
      image.sizes = sizes;
    }
    image.src = src;
    
    // Remove data attributes to prevent reprocessing
    image.removeAttribute('data-src');
    image.removeAttribute('data-srcset');
    image.removeAttribute('data-sizes');
    
    // Update classes
    image.classList.remove(this.options.loadingClass);
    image.classList.add(this.options.loadedClass);
    
    // Restore original styles
    this.restoreStyles(image);
    
    // Dispatch event
    image.dispatchEvent(new CustomEvent('imageLoaded'));
  }

  /**
   * Handle image load error
   * @param {HTMLImageElement} image - Image element
   */
  onImageError(image) {
    // Update classes
    image.classList.remove(this.options.loadingClass);
    image.classList.add(this.options.errorClass);
    
    // Set fallback image if provided
    if (image.dataset.fallback) {
      image.src = image.dataset.fallback;
    }
    
    // Dispatch event
    image.dispatchEvent(new CustomEvent('imageError'));
  }

  /**
   * Restore original image styles
   * @param {HTMLImageElement} image - Image element
   */
  restoreStyles(image) {
    if (image.dataset.originalStyles) {
      try {
        const originalStyles = JSON.parse(image.dataset.originalStyles);
        
        // Apply a fade-in effect
        image.style.opacity = '0';
        
        // Use setTimeout to create a smooth transition
        setTimeout(() => {
          // Restore original background color after a delay
          image.style.backgroundColor = originalStyles.backgroundColor || '';
          image.style.opacity = '1';
          
          // Remove blur effect if applied
          image.style.filter = 'none';
        }, 50);
      } catch (e) {
        console.error('Error restoring image styles:', e);
      }
    }
  }

  /**
   * Load all images immediately (fallback for browsers without IntersectionObserver)
   */
  loadAllImages() {
    const images = document.querySelectorAll(this.options.selector);
    images.forEach(image => this.loadImage(image));
  }

  /**
   * Refresh the image optimizer (for dynamically added content)
   */
  refresh() {
    // Find all unprocessed images
    const newImages = document.querySelectorAll(
      `${this.options.selector}:not(.${this.options.loadingClass}):not(.${this.options.loadedClass})`
    );
    
    // Process each new image
    newImages.forEach(image => {
      image.classList.add(this.options.loadingClass);
      this.setPlaceholder(image);
      this.observer.observe(image);
    });
  }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create global instance
  window.imageOptimizer = new ImageOptimizer();
  
  // Add CSS for image transitions
  const style = document.createElement('style');
  style.textContent = `
    .img-loading {
      opacity: 0.6;
      filter: blur(5px);
      transition: opacity 0.3s ease, filter 0.5s ease;
    }
    
    .img-loaded {
      opacity: 1;
      filter: none;
      transition: opacity 0.3s ease, filter 0.5s ease;
    }
    
    .img-error {
      opacity: 0.5;
      filter: grayscale(100%);
    }
  `;
  document.head.appendChild(style);
});
