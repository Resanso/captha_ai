const API_URL = "https://api.openai.com/v1/chat/completions";
let isVerified = false;

async function checkEmotion() {
  const userInput = document.getElementById("userInput").value;
  const characterImage = document.getElementById("characterImage");
  const characterMessage = document.getElementById("characterMessage");
  const result = document.getElementById("result");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer YOUR_API_KEY",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an emotion analyzer. Rate the positivity of the following message on a scale of 1-10 and respond with just the number.",
          },
          {
            role: "user",
            content: userInput,
          },
        ],
      }),
    });

    const data = await response.json();
    const score = parseInt(data.choices[0].message.content);

    if (score >= 7) {
      characterImage.src = "images/happy.png";
      characterMessage.textContent = "Yay! You made me happy! You can proceed!";
      result.innerHTML =
        '<span style="color: green;">Verification successful!</span>';
      isVerified = true;
    } else {
      characterImage.src = "images/sad.png";
      characterMessage.textContent = "Hmm... Try saying something nicer!";
      result.innerHTML = '<span style="color: red;">Try again!</span>';
    }
  } catch (error) {
    console.error("Error:", error);
    result.innerHTML =
      '<span style="color: red;">An error occurred. Please try again.</span>';
  }
}

// Prevent form submission if not verified
document.querySelector("form")?.addEventListener("submit", (e) => {
  if (!isVerified) {
    e.preventDefault();
    alert("Please complete the emotional CAPTCHA first!");
  }
});
