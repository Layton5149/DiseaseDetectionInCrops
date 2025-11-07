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

document.addEventListener("DOMContentLoaded", async () => {
    if (!await checkAuth()) {
        window.location.href = "/auth";
    }

    //get user info
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    const userEmail = userData.user?.email || null;
    const userId = userData.user?.id || null;

    const {data, error} = await supabase
        .from('imageInfo')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', {ascending: false});
    if (error) {
        console.error("Error fetching image history:", error);
        return;
    }
    console.log("Image history data:", data);

    const historyContainer = document.getElementById("history-list");

    if (data.length === 0) {
        const noDataMessage = document.createElement("h1");
        noDataMessage.textContent = "No image upload history found.";
        historyContainer.appendChild(noDataMessage);
        return;
    }

    data.forEach(async (item)=> {
        console.log(item.image_path);
        const { data: imgData, error: signedErr } = await supabase.storage
            .from('images')
            .getPublicUrl(item.image_path); // update to signed urls at a later date
        if (signedErr) {
            console.error("Error creating signed URL:", signedErr);
            return;
        }

        //create a container for each history item
        const itemContainer = document.createElement("div");
        itemContainer.classList.add("history-item", "mb-4", "d-flex", "bg-light"); 
        itemContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
        itemContainer.style.padding = "15px";
        itemContainer.style.borderRadius = "8px";

        //create a container for text part of card
        const textContainer = document.createElement("div");
        textContainer.classList.add("history-text-container", "mb-2");
        textContainer.style.marginLeft = "20px";
        textContainer.style.marginRight = "20px";
        
        //create image element
        const image = document.createElement("img");
        image.style.borderRadius = "8px";
        image.src = imgData.publicUrl;
        image.alt = "Uploaded Image";
        image.style.maxWidth = "200px";
        itemContainer.appendChild(image);

        //text elements 
        //create timestamp element
        const timestamp = new Date(item.created_at).toLocaleString();
        const timestampElem = document.createElement("p");
        timestampElem.textContent = "Uploaded at: " + timestamp;
        textContainer.appendChild(timestampElem);

        //create description element (placeholder for now )
        const descriptionElem = document.createElement("p");
        descriptionElem.textContent = "Description: (not available)";
        textContainer.appendChild(descriptionElem);

        //append children to parent containers
        itemContainer.appendChild(textContainer);
        historyContainer.appendChild(itemContainer);
    });
});