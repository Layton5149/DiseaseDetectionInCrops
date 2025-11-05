import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = window.SUPABASE_URL;
const supabaseAnonKey = window.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener("DOMContentLoaded", () => {
  const signinForm = document.getElementById("signin-form");
  const signupForm = document.getElementById("signup-form");
  const showSignup = document.getElementById("show-signup");
  const showSignin = document.getElementById("show-signin");

  // Toggle between forms
  showSignup.addEventListener("click", () => {
    signinForm.classList.add("d-none");
    signupForm.classList.remove("d-none");
  });

  showSignin.addEventListener("click", () => {
    signupForm.classList.add("d-none");
    signinForm.classList.remove("d-none");
  });

  // Handle sign-in
  signinForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("signin-email").value.trim();
    const password = document.getElementById("signin-password").value.trim();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Sign in failed: " + error.message);
      console.error(error);
      return;
    }

    alert("Signed in successfully!");
    console.log("User session:", data.session);
    window.location.href = "/";
  });

  // Handle sign-up
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      display_name: name,
    });

    if (error) {
      alert("Sign up failed: " + error.message);
      console.error(error);
      return;
    }

    alert("Account created! Check your email for confirmation.");
    console.log("User:", data.user);
    signupForm.reset();
    signupForm.classList.add("d-none");
    signinForm.classList.remove("d-none");
  });
});
