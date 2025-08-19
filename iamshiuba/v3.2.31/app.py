"""
Legacy app.py - Simplified wrapper for the new application factory

This file is kept for backward compatibility but now uses the refactored structure.
All the application logic has been moved to:
- __init__.py (application factory)
- blueprints/ (route organization)
- services/ (business logic)

To run the application, you can use either:
- python app.py (this file)
- python wsgi.py (recommended)
"""

# Import the new application factory
from __init__ import create_app

# Create app instance using the new factory
app = create_app()

if __name__ == "__main__":
    app.run()
