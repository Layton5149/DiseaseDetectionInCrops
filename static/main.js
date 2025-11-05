import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

document.addEventListener("DOMContentLoaded", () => {
    const uploadImageButton = document.getElementById("upload-image-button");
    const uploadImageResultText = document.getElementById("upload-image-result-text");
    const uploadImageResult = document.getElementById("uploaded-image-preview");
    const fileInput = document.getElementById("file");

    const favFoodSubmitButton = document.getElementById("fav-food-submit-button");
    const submitFavFoodResultText = document.getElementById("submit-fav-food-result-text");
    const foodInput = document.getElementById("food");

    //event listener for food submission
    favFoodSubmitButton.addEventListener("click", async (event) => {
        event.preventDefault();

        if (!await checkAuth()) {
            submitFavFoodResultText.textContent = ("Please sign in to submit your favourite food.");
            return;
        }

        const favouriteFood = foodInput.value.trim();
        if (favouriteFood === "") {
            submitFavFoodResultText.textContent = ("Please enter a food item.");
            return;
        } 
        try {
      const { data, error } = await supabase
        .from("imageInfo")
        .insert([{ food_response: favouriteFood}]) 
        .select(); 
      if (error) throw error;

      submitFavFoodResultText.textContent = ("Thanks! Saved your response.");
      foodInput.value = "";
    } catch (err) {
      console.error(err);
      submitFavFoodResultText.textContent = ("Sorry, we couldn't save that. Please try again.");
    } finally {
      favFoodSubmitButton.disabled = false;
      favFoodSubmitButton.textContent = "Submit";
    }
  });

    //event listeners
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
                const { data: userData, error: userErr } = await supabase.auth.getUser();
                const user = userData.user;

                const { data: Data, error: Error } = await supabase
                    .from("imageInfo")
                    .insert([{ image_path: filePath ,user_id: user.id}]) 
                    .select();
                
                if (Error) {
                    console.error("Error saving file info:", Error);
                    uploadImageResultText.textContent = "Error saving file info. Please try again.";
                    return;
                }
                
                // 2️⃣ Get a public URL
                const { data: publicData } = await supabase.storage
                .from("images")
                .getPublicUrl(filePath);

                const publicUrl = publicData.publicUrl;
                console.log("Image URL:", publicUrl);


                uploadImageResult.innerHTML = ""; // Clear previous image
                uploadImageResult.src = publicUrl;
                uploadImageResult.classList.remove("d-none");

                uploadImageResultText.textContent = "File uploaded successfully!";
            }
        }
    })
})

