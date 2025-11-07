from flask import Flask, jsonify, render_template, request
from dotenv import load_dotenv
import os
from flask_mail import Mail, Message
import re

load_dotenv("apiKey.env")

app = Flask(__name__)

app.config.update(
    MAIL_SERVER=os.getenv("MAIL_SERVER", "localhost"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", "25")),
    MAIL_USE_TLS=os.getenv("MAIL_USE_TLS", "false").lower() == "true",
    MAIL_USE_SSL=os.getenv("MAIL_USE_SSL", "false").lower() == "true",
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_DEFAULT_SENDER=os.getenv("MAIL_DEFAULT_SENDER"),
)
RECIPIENT_EMAIL = os.getenv("RECIPIENT_EMAIL")

mail = Mail(app)

# simple email format check
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

#ROUTES 
# home
@app.route('/')
def home():
    return render_template(
        "index.html",
        SUPABASE_URL=os.getenv("SUPABASE_URL"),
        SUPABASE_ANON_KEY=os.getenv("SUPABASE_ANON_KEY")
    )

#auth page
@app.route("/auth")
def auth():
    return render_template(
        "auth.html",
        SUPABASE_URL=os.getenv("SUPABASE_URL"),
        SUPABASE_ANON_KEY=os.getenv("SUPABASE_ANON_KEY"))

#history page
@app.route("/history")
def history():
    return render_template(
        "history.html",
        SUPABASE_URL=os.getenv("SUPABASE_URL"),
        SUPABASE_ANON_KEY=os.getenv("SUPABASE_ANON_KEY"))

#model info page
@app.route("/modelInfo")
def modelInfo():
    return render_template("modelInfo.html")

#encyclopedia page
@app.route("/diseaseInfo")
def diseaseInfo():
    return render_template("diseaseInfo.html")

#contact page
@app.route("/contact")
def contact():
    return render_template("contact.html")


#contact form submission handler
@app.post("/contact-submit")
def contactSubmit():
    data = request.get_json(silent=True) or request.form

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    message = (data.get("message") or "").strip()

    # Build the email
    subject = f"New contact form message from {name}"
    body = f"From: {name} <{email}>\n\nMessage:\n{message}"

    try:
        msg = Message(
            subject=subject,
            recipients=[RECIPIENT_EMAIL],
            body=body,
        )
        # Don't spoof the sender; set Reply-To so you can answer them
        msg.reply_to = email

        mail.send(msg)
        return jsonify({"ok": True, "message": "Thanks! Your message was sent."}), 200
    except Exception as e:
        # Log in real apps; don't leak details to the client
        return jsonify({"ok": False, "error": "Failed to send message, please make sure all fields are complete."}), 500


if __name__ == "__main__":
    app.run(debug=True)
