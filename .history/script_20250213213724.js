const API_URL = "https://api.groq.com/openai/v1/chat/completions";
// Replace this with your actual Groq API key
const GROQ_API_KEY = "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";
let isVerified = false;

async function checkEmotion() {
  const userInput = document.getElementById("userInput").value;
  const characterImage = document.getElementById("characterImage");
  const characterMessage = document.getElementById("characterMessage");
  const result = document.getElementById("result");
  const submitButton = document.querySelector("button");

  if (!userInput.trim()) {
    result.innerHTML =
      '<span style="color: red;">Please enter some text!</span>';
    return;
  }

  try {
    // Show loading state
    submitButton.disabled = true;
    result.innerHTML = '<span style="color: gray;">Processing...</span>';
    characterMessage.textContent = "Thinking...";

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are an emotional AI character named Moji. First rate the positivity of the user's message on a scale of 1-10, then respond with the format: 'SCORE: [number]\nRESPONSE: [your emotional reaction in one short sentence, using emojis]'. Keep the response personal and related to what they said.",
          },
          {
            role: "user",
            content: userInput,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Invalid response from API");
    }

    const aiResponse = data.choices[0].message.content;
    const [scorePart, responsePart] = aiResponse.split("\n");
    const score = parseInt(scorePart.replace("SCORE:", ""));
    const emotionalResponse = responsePart.replace("RESPONSE:", "").trim();

    if (score >= 7) {
      characterImage.src = "images/happy.png";
      characterMessage.textContent = emotionalResponse;
      result.innerHTML =
        '<span style="color: green;">Verification successful!</span>';
      isVerified = true;
    } else {
      characterImage.src = "images/sad.png";
      characterMessage.textContent = emotionalResponse;
      result.innerHTML = '<span style="color: red;">Try again!</span>';
    }
  } catch (error) {
    console.error("Error:", error);
    characterImage.src = "images/neutral.png";
    characterMessage.textContent = "Oops! Something went wrong.";
    result.innerHTML = `<span style="color: red;">Error: ${
      error.message || "Please try again"
    }</span>`;
  } finally {
    submitButton.disabled = false;
  }
}

// Prevent form submission if not verified
document.querySelector("form")?.addEventListener("submit", (e) => {
  if (!isVerified) {
    e.preventDefault();
    alert("Please complete the emotional CAPTCHA first!");
  }
});
