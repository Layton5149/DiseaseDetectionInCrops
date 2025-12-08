import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { diseaseDescriptions, diseaseLinks } from "./diseaseData.js";

const supabaseUrl = window.SUPABASE_URL;
const supabaseAnonKey = window.SUPABASE_ANON_KEY;
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key:", supabaseAnonKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// is the user loged in?
const checkAuth = async () => {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    console.log(userData.user);
    if (userErr || !userData?.user) {
      return false;
    }
    else {
        return true;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    const userEmail = userData.user?.email || null;
    const userId = userData.user?.id || null;

    const uploadImageButton = document.getElementById("upload-image-button");

    const classificationResultsContainer = document.getElementById("classification-results-container");
    const classificationResultText = document.getElementById("image-classification-result-text");
    const uploadImageResult = document.getElementById("uploaded-image-preview"); //img element

    const uploadImageResultText = document.getElementById("upload-image-result-text");
    
    const fileInput = document.getElementById("file");

    const logInButton = document.getElementById("sign-in-button");
    const logoutButton = document.getElementById("logout-button");

    //log in / log out button visibility
    if (await checkAuth()) {
        document.getElementById("logout-button").classList.remove("d-none");
        console.log("User signed in");
    }
    else {
        document.getElementById("sign-in-button").classList.remove("d-none");
        console.log("User not signed in");
    }

    //event listeners
    //log out button
    logoutButton.addEventListener("click", async (event) => {
        event.preventDefault();
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error);
            return; 
        }
        // take user to sign in page
        logInButton.classList.remove("d-none");
        logoutButton.classList.add("d-none");
        window.location.href = "/auth";
    });

    //upload image button
    uploadImageButton.addEventListener("click",async (event)  => {
        event.preventDefault();

        if (!await checkAuth()) {
            uploadImageResultText.textContent = "Please sign in to upload an image.";
            return;
        }

        if (fileInput.files.length == 0) {
            uploadImageResultText.textContent = "Please select a file to upload.";
            return;
        }
        else {
            const file = fileInput.files[0]; 
            const filePath = String(file.name + Date.now());
            const { data, error } = await supabase.storage
                .from("images")
                .upload(filePath, file);
            if (error) {
                console.error("Error uploading file:", error);
                uploadImageResultText.textContent = "Error uploading file. Please try again.";
            }
            else {
                //write the fiel path to imageInfo table
                const { data: insertData, error: Error } = await supabase
                    .from("imageInfo")
                    .insert([{ image_path: filePath ,user_id: userId}]) 
                    .select();
                
                if (Error) {    
                    console.error("Error saving file info:", Error);
                    uploadImageResultText.textContent = "Error saving file info. Please try again.";
                    return;
                }
                else {
                    uploadImageResultText.textContent = "File uploaded successfully!";
                }

                const imageInfoRow = insertData?.[0];
                const imageInfoId = imageInfoRow?.id;
                console.log("Inserted imageInfo row:", imageInfoRow);  
                
                const { data: publicData } = await supabase.storage
                .from("images")
                .getPublicUrl(filePath); // update to signed urls at a later date

                const publicUrl = publicData.publicUrl;

                //classift image
                const classifyResponse = await fetch("/classify-image", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ publicUrl })
                    });

                const classifyData = await classifyResponse.json();
                console.log("Image classification result:", classifyData);

                classificationResultsContainer.classList.remove("d-none");
                classificationResultsContainer.classList.add("d-flex");

                uploadImageResult.src = publicUrl;
                uploadImageResult.classList.remove("d-none");

                classificationResultText.textContent = `Predicted Disease: ${classifyData.predicted_class} (Confidence: ${classifyData.confidence.toFixed(2)}%)`;
                
                //upadate the imageInfo table with classification results
                const { data: updateData, updateError } = await supabase
                    .from("imageInfo")
                    .update({disease_name: classifyData.predicted_class })
                    .eq("id", imageInfoId)
                    .select();
                if (updateError) {
                    console.error("Error updating classification result:", error);
                    return;
                }
                else{
                    console.log("Classification result updated successfully:", updateData);
                }
                console.log("File upload and classification process completed.");
            }
        }

    })
})

