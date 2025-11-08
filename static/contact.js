
addEventListener("DOMContentLoaded", async() => {
    const contactForm = document.getElementById("contact-form");
    const sendMessageButton = document.getElementById("send-message-button");
    const messageResultText = document.getElementById("message-result-text");

    sendMessageButton.addEventListener("click", (e) => {
        e.preventDefault(); //prevent the default form submission
        const email = document.getElementById("email").value;
        const name = document.getElementById("name").value;
        const message = document.getElementById("message").value;

        console.log("Sending message:", { email, name, message });

        //sanity checks 
        if (!email || !name || !message) {
            messageResultText.textContent = "Please fill in all fields.";
            return;
        }

        //post request
        fetch("/contact-submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                name: name,
                message: message
            })
        }).then(response => response.json())
        .then(data => {
            messageResultText.textContent = data.message;
            contactForm.reset();
        }).catch(error => {
            console.error("Error:", error);
            alert("An unexpected error occurred.");
        });
    });
});