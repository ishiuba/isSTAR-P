# iSHIUBA (Django)

This Django project aims to facilitate on making updates of the files. It replaces the old vanilla ishiuba-js project that only uses HTML5, CSS, JS and Bootstrap 5.

## Requirements

- Python 3.x
- Django 5.1.x
- Dependencies listed in the requirements.txt file

## Installation

- Clone the repository: git clone https://github.com/ishiuba/iamshiubadj.git
- Install virtual python environment: ``python -m venv venv`` (Recommended)
- Install dependencies: ``pip install -r requirements.txt``
- Run migrations: ``python manage.py migrate``
- Run the development server: ``python manage.py runserver``

## Project Structure

- **layout**: defines the layout of all templates
- **project**: core of the web project that contains the templates ``(pages, partials)``
- **pages**: templates that contain the pages
- **partials**: templates that contain reusable components