from myapp.app import app

# Vercel precisa da variável 'app' exportada
app = app

if __name__ == "__main__":
    app.run()
