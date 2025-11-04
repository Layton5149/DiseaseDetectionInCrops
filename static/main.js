import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://zxfcpudnurkimijljbop.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4ZmNwdWRudXJraW1pamxqYm9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzM1OTUsImV4cCI6MjA3Nzg0OTU5NX0.OOgGU3CbllrxvTw1D4IrJo6C8whwcxjck-d4cCIS3f0";

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key:", supabaseAnonKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.getElementById("submit-button");
    const submitResult = document.getElementById("submit-result");
    const fileInput = document.getElementById("file");

    const foodSubmitButton = document.getElementById("food-submit-button");
    const foodInput = document.getElementById("food");

    //event listener for food submission
    foodSubmitButton.addEventListener("click", async (event) => {
        event.preventDefault();
        const favouriteFood = foodInput.value.trim();
        if (favouriteFood === "") {
            //send text to supabase
            return;
        } 
        try {
      const { data, error } = await supabase
        .from("imageInfo")
        .insert([{ food_response: favouriteFood}]) //array form allows bulk later
        .select(); // returns inserted row(s)

      if (error) throw error;

      // Success UI
      alert("Thanks! Saved your response.");
      foodInput.value = "";
      // You can also show the saved row somewhere if you want:
      // console.log("Inserted:", data);
    } catch (err) {
      console.error(err);
      alert("Sorry, we couldn't save that. Please try again.");
    } finally {
      foodSubmitButton.disabled = false;
      foodSubmitButton.textContent = "Submit";
    }
  });

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

