from flask import Flask, render_template
from dotenv import load_dotenv
import os

load_dotenv("apiKey.env")

app = Flask(__name__)

# Simple homepage route
@app.route('/')
def home():
    return render_template(
        "index.html",
        SUPABASE_URL=os.getenv("SUPABASE_URL"),
        SUPABASE_ANON_KEY=os.getenv("SUPABASE_ANON_KEY")
    )

@app.route("/auth")
def auth():
    return render_template(
        "auth.html",
        SUPABASE_URL=os.getenv("SUPABASE_URL"),
        SUPABASE_ANON_KEY=os.getenv("SUPABASE_ANON_KEY"))


if __name__ == "__main__":
    app.run(debug=True)
