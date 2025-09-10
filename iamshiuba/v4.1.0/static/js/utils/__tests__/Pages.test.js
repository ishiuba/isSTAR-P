/**
 * Test suite for PageNavigationManager
 * Simple tests to verify basic functionality
 */

// Mock DOM elements for testing
function createMockDOM() {
  // Create test HTML structure
  document.body.innerHTML = `
    <nav>
      <a href="#home" data-page-target="home">Home</a>
      <a href="#about" data-page-target="about">About</a>
      <a href="#contact" data-page-target="contact">Contact</a>
    </nav>
    
    <main>
      <section data-page-content="home" class="page-section">
        <h1>Home Page</h1>
        <p>Welcome to the home page</p>
      </section>
      
      <section data-page-content="about" class="page-section hidden">
        <h1>About Page</h1>
        <p>About us content</p>
      </section>
      
      <section data-page-content="contact" class="page-section hidden">
        <h1>Contact Page</h1>
        <p>Contact information</p>
      </section>
    </main>
  `;
}

// Basic test functions
function testPageManagerInitialization() {
  console.log('Testing PageNavigationManager initialization...');
  
  createMockDOM();
  
  const manager = new PageNavigationManager({
    enableLogging: true,
    defaultPage: 'home'
  });
  
  // Test initialization
  if (manager.isReady()) {
    console.log('✓ Manager initialized successfully');
  } else {
    console.error('✗ Manager failed to initialize');
  }
  
  // Test valid pages discovery
  const validPages = manager.getValidPages();
  if (validPages.has('home') && validPages.has('about') && validPages.has('contact')) {
    console.log('✓ Valid pages discovered correctly');
  } else {
    console.error('✗ Failed to discover valid pages');
  }
  
  // Test current page
  if (manager.getCurrentPage() === 'home') {
    console.log('✓ Default page set correctly');
  } else {
    console.error('✗ Default page not set correctly');
  }
  
  return manager;
}

function testNavigation(manager) {
  console.log('Testing navigation functionality...');
  
  // Test navigation to different page
  manager.navigateToPage('about');
  
  if (manager.getCurrentPage() === 'about') {
    console.log('✓ Navigation to about page successful');
  } else {
    console.error('✗ Navigation to about page failed');
  }
  
  // Test invalid page navigation
  manager.navigateToPage('invalid-page');
  
  if (manager.getCurrentPage() === 'home') {
    console.log('✓ Invalid page navigation handled correctly');
  } else {
    console.error('✗ Invalid page navigation not handled correctly');
  }
}

function testEventHandling(manager) {
  console.log('Testing event handling...');
  
  let eventFired = false;
  
  // Listen for navigation events
  document.addEventListener('pagemanager:navigate', (event) => {
    eventFired = true;
    console.log('✓ Navigation event fired:', event.detail);
  });
  
  // Trigger navigation
  manager.navigateToPage('contact');
  
  // Give a moment for event to fire
  setTimeout(() => {
    if (eventFired) {
      console.log('✓ Event handling working correctly');
    } else {
      console.error('✗ Event handling not working');
    }
  }, 100);
}

function testCleanup(manager) {
  console.log('Testing cleanup functionality...');
  
  manager.destroy();
  
  if (!manager.isReady()) {
    console.log('✓ Manager destroyed successfully');
  } else {
    console.error('✗ Manager destruction failed');
  }
}

// Run tests when DOM is ready
function runTests() {
  console.log('Starting PageNavigationManager tests...');
  
  try {
    const manager = testPageManagerInitialization();
    testNavigation(manager);
    testEventHandling(manager);
    
    setTimeout(() => {
      testCleanup(manager);
      console.log('All tests completed!');
    }, 200);
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Export test functions for manual testing
if (typeof window !== 'undefined') {
  window.runPageNavigationTests = runTests;
  window.createMockDOM = createMockDOM;
}

// Auto-run tests if this file is loaded directly
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runTests);
} else {
  runTests();
}
