from flask import Flask, render_template
from dotenv import load_dotenv

import os

load_dotenv()

app = Flask(__name__)

# Simple homepage route
@app.route('/')
def home():
    SUPABASE_URL=os.getenv("SUPABASE_URL"),
    SUPABASE_ANON_KEY=os.getenv("SUPABASE_ANON_KEY"),
    return render_template('index.html')


if __name__ == "__main__":
    app.run(debug=True)
