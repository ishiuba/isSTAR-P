# IamSHIUBA (Flask)

A lightweight Flask-based web application that replaces the original iamshiubadj project (which used Django). This version focuses on simplicity and performance while maintaining all core functionalities.

## Features

- Modern and responsive web interface
- Lightweight alternative to the Django version
- Easy file management and updates
- Modular template system
- Static file optimization

## Requirements

- Python 3.x
- Flask 3.0.x
- Additional dependencies listed in `requirements.txt`

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/ishiuba/iamshiuba.git
   cd iamshiuba
   ```

2. Set up Python virtual environment (Recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the development server:
   ```bash
   flask run
   ```

5. Visit `http://localhost:5000` in your browser

## Project Structure

```
myapp/               # Core web project
├── static/          # Static assets (CSS, JS, JSON, images)
├── templates/       # HTML5 files
│   ├── base.html    # Base layout template
│   ├── errors/      # Error templates
│   ├── pages/       # Page templates
│   └── partials/    # Reusable components
└── tests/           # Python tests
```
