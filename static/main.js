

document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.getElementById("submit-button");
    const submitResult = document.getElementById("submit-result");
    const fileInput = document.getElementById("file");

    //event listeners
    submitButton.addEventListener("click", (event) => {
        event.preventDefault();
        if (fileInput.files.length == 0) {
            submitResult.textContent = "Please select a file to upload.";
            return;
        }
        else {
            submitResult.textContent = "File uploaded successfully!"; // add stuff here once supabase connected
            return;
        }
    })
})

