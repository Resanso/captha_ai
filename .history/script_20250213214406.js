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
    result.innerHTML = '<span style="color: red;">Tolong masukkan teks!</span>';
    return;
  }

  try {
    // Show loading state
    submitButton.disabled = true;
    result.innerHTML = '<span style="color: gray;">Sedang memproses...</span>';
    characterMessage.textContent = "Hmm...";
    characterImage.className = "thinking";

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
              "Kamu adalah karakter AI bernama Moji yang berbahasa Indonesia. Nilai tingkat positif dari pesan pengguna dengan skala 1-10, lalu berikan respons dengan format: 'SCORE: [angka]\nRESPONSE: [reaksi emosionalmu dalam satu kalimat pendek, gunakan emoji]'. Buat responsnya personal dan sesuai dengan apa yang mereka katakan.",
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
      characterImage.className = "happy";
      setTimeout(() => (characterImage.className = ""), 500);
      characterImage.src = "images/happy.png";
      characterMessage.textContent = emotionalResponse;
      result.innerHTML =
        '<span style="color: green;">Verifikasi berhasil!</span>';
      isVerified = true;
    } else {
      characterImage.className = "sad";
      setTimeout(() => (characterImage.className = ""), 500);
      characterImage.src = "images/sad.png";
      characterMessage.textContent = emotionalResponse;
      result.innerHTML = '<span style="color: red;">Coba lagi!</span>';
    }
  } catch (error) {
    console.error("Error:", error);
    characterImage.className = "";
    characterImage.src = "images/neutral.png";
    characterMessage.textContent = "Ups! Terjadi kesalahan.";
    result.innerHTML = `<span style="color: red;">Error: ${
      error.message || "Silakan coba lagi"
    }</span>`;
  } finally {
    submitButton.disabled = false;
  }
}

// Prevent form submission if not verified
document.querySelector("form")?.addEventListener("submit", (e) => {
  if (!isVerified) {
    e.preventDefault();
    alert("Silakan selesaikan CAPTCHA emosional terlebih dahulu!");
  }
});

// Tambahkan animasi idle
document.getElementById("userInput").addEventListener("input", (e) => {
  const characterImage = document.getElementById("characterImage");
  if (e.target.value) {
    characterImage.className = "thinking";
  } else {
    characterImage.className = "";
  }
});
