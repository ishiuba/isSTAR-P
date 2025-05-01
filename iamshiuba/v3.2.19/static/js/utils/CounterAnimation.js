/**
 * CounterAnimation.js
 * A lightweight script to animate number counters on the page
 */

class CounterAnimation {
  constructor(options = {}) {
    // Default options
    this.defaults = {
      selector: '.counter',
      duration: 2000,
      easing: 'easeOutExpo',
      once: true,
      offset: 100,
      delay: 0,
      decimals: 0,
      separator: '',
      prefix: '',
      suffix: ''
    };

    // Merge options with defaults
    this.options = { ...this.defaults, ...options };
    
    // Initialize counters
    this.init();
  }

  /**
   * Initialize the counter animation
   */
  init() {
    // Get all counter elements
    this.counters = document.querySelectorAll(this.options.selector);
    
    if (this.counters.length === 0) return;
    
    // Set up intersection observer for triggering animations
    this.setupObserver();
    
    // For browsers that don't support IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      this.counters.forEach(counter => this.animateCounter(counter));
    }
  }

  /**
   * Set up intersection observer to trigger animations when elements are in view
   */
  setupObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          
          // If set to animate only once, unobserve after animation
          if (this.options.once) {
            observer.unobserve(entry.target);
          }
        }
      });
    }, options);

    // Observe all counter elements
    this.counters.forEach(counter => {
      observer.observe(counter);
    });
  }

  /**
   * Animate a single counter element
   * @param {HTMLElement} counter - The counter element to animate
   */
  animateCounter(counter) {
    // Get counter-specific options or use defaults
    const duration = counter.dataset.duration || this.options.duration;
    const easing = counter.dataset.easing || this.options.easing;
    const decimals = counter.dataset.decimals || this.options.decimals;
    const separator = counter.dataset.separator || this.options.separator;
    const prefix = counter.dataset.prefix || this.options.prefix;
    const suffix = counter.dataset.suffix || this.options.suffix;
    const delay = counter.dataset.delay || this.options.delay;
    
    // Get target number from element content or data attribute
    const target = parseFloat(counter.dataset.target || counter.innerText);
    
    // Set starting value
    let startValue = 0;
    let currentValue = startValue;
    
    // Set start time with delay
    const startTime = performance.now() + parseInt(delay);
    
    // Format the number with proper separators and decimals
    const formatNumber = (num) => {
      return num.toLocaleString('en-US', {
        minimumFractionDigits: parseInt(decimals),
        maximumFractionDigits: parseInt(decimals)
      }).replace(/,/g, separator);
    };
    
    // Easing functions
    const easingFunctions = {
      linear: t => t,
      easeInQuad: t => t * t,
      easeOutQuad: t => t * (2 - t),
      easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      easeInCubic: t => t * t * t,
      easeOutCubic: t => (--t) * t * t + 1,
      easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
      easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
    };
    
    // Get easing function
    const ease = easingFunctions[easing] || easingFunctions.easeOutExpo;
    
    // Animation function
    const animate = (timestamp) => {
      // Don't start until after delay
      if (timestamp < startTime) {
        requestAnimationFrame(animate);
        return;
      }
      
      // Calculate progress
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Apply easing
      const easedProgress = ease(progress);
      
      // Calculate current value
      currentValue = startValue + (target - startValue) * easedProgress;
      
      // Update counter text
      counter.textContent = `${prefix}${formatNumber(currentValue)}${suffix}`;
      
      // Continue animation if not complete
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    // Start animation
    requestAnimationFrame(animate);
  }
}

// Initialize counters when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.counterAnimation = new CounterAnimation();
});
