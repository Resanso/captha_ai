const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = "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";
let isVerified = false;
let romanceQueryCount = 0; // Add counter for romance-related queries

async function checkEmotion() {
  const userInput = document.getElementById("userInput").value.toLowerCase();
  const characterEyebrows = document.getElementById("characterEyebrows");
  const characterEyes = document.getElementById("characterEyes");
  const characterMouth = document.getElementById("characterMouth");
  const characterMessage = document.getElementById("characterMessage");
  const result = document.getElementById("result");
  const submitButton = document.querySelector("button");
  const characterWrapper = document.querySelector(".character-wrapper");

  function setEmotion(emotion) {
    characterWrapper.classList.remove("happy", "sad", "angry", "neutral");
    characterWrapper.classList.add(emotion);
  }

  if (!userInput.trim()) {
    result.innerHTML = '<span style="color: red;">Tolong masukkan teks!</span>';
    return;
  }

  // Check for romance-related keywords
  const romanceKeywords = [
    "pacar",
    "jesika",
    "jodoh",
    "cinta",
    "asmara",
    "putus",
    "kangen",
    "rindu",
    "sayang",
  ];
  const isRomanceRelated = romanceKeywords.some((keyword) =>
    userInput.includes(keyword)
  );

  if (isRomanceRelated) {
    romanceQueryCount++;
  }

  try {
    // Show loading state
    submitButton.disabled = true;
    result.innerHTML = '<span style="color: gray;">Sedang memproses...</span>';
    characterMessage.textContent = "Hmm...";

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
              "Kamu adalah karakter AI bernama Resan, seorang mahasiswa informatika yang memiliki kegemaran gym. Karakteristik dan latar belakangmu:\n" +
              "- Sangat passionate tentang gym dan sudah berlatih selama 3 tahun\n" +
              "- Mahasiswa informatika yang sangat tertarik dengan programming dan teknologi\n" +
              `- ${
                romanceQueryCount >= 3
                  ? "Sedang dalam masa sulit karena putus dengan Jesika, dan masih sangat merindukannya"
                  : "Cenderung menghindar membahas topik asmara"
              }\n\n` +
              "Nilai input user dengan skala 1-10 berdasarkan:\n" +
              "- Score 8-10: Jika membahas tentang gym, progress fitness, atau memberikan pujian tentang dedikasi gym-mu\n" +
              "- Score 7-9: Jika membahas programming, teknologi, atau project IT yang menarik\n" +
              "- Score 2-4: Untuk topik tentang asmara atau hubungan (gunakan nada sedih)\n" +
              "- Score 1-3: Untuk komentar negatif atau yang membahas kehidupan pribadi secara tidak sopan\n\n" +
              "Format respons:\n" +
              `SCORE: ${isRomanceRelated ? "3" : "[angka]"}\n` +
              "RESPONSE: [reaksi emosional dalam satu kalimat pendek, untuk topik asmara gunakan nada sedih]",
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

    // Modify the response handling for romance topics
    if (isRomanceRelated) {
      setEmotion("sad");
      characterEyebrows.src = "asset/alis sedih.svg";
      characterEyes.src = "asset/mata.svg";
      characterMouth.src = "asset/mulut sedih.svg";
      if (romanceQueryCount >= 3) {
        characterMessage.textContent = emotionalResponse;
      } else {
        characterMessage.textContent =
          "Ah... aku sedang tidak ingin membahas hal itu... 😔";
      }
      result.innerHTML =
        '<span style="color: blue;">Sepertinya ini topik sensitif...</span>';
    } else {
      if (score >= 7) {
        setEmotion("happy");
        characterEyebrows.src = "asset/alis netral.svg";
        characterEyes.dataset.openEyes = "asset/mata.svg"; // Store the open eyes state
        characterEyes.src = "asset/mata.svg";
        characterMouth.src = "asset/mulut senang.svg";
        characterMessage.textContent = emotionalResponse;
        result.innerHTML =
          '<span style="color: green;">Verifikasi berhasil!</span>';
        isVerified = true;
      } else if (score <= 3) {
        setEmotion("sad");
        characterEyebrows.src = "asset/alis sedih.svg";
        characterEyes.src = "asset/mata.svg";
        characterMouth.src = "asset/mulut sedih.svg";
        characterMessage.textContent = emotionalResponse;
        result.innerHTML = '<span style="color: red;">Coba lagi!</span>';
      } else {
        setEmotion("neutral");
        characterEyebrows.src = "asset/alis netral.svg";
        characterEyes.src = "asset/mata.svg";
        characterMouth.src = "asset/mulut netral.svg";
        characterMessage.textContent = emotionalResponse;
        result.innerHTML = '<span style="color: orange;">Hampir!</span>';
      }
    }
  } catch (error) {
    setEmotion("sad");
    console.error("Error:", error);
    characterEyebrows.src = "asset/alis sedih.svg";
    characterEyes.src = "asset/mata tertutup.svg";
    characterMouth.src = "asset/mulut sedih.svg";
    characterMessage.textContent = "Ups! Terjadi kesalahan.";
    result.innerHTML = `<span style="color: red;">Error: ${
      error.message || "Silakan coba lagi"
    }</span>`;
  } finally {
    submitButton.disabled = false;
  }
}

// Replace the old blinking functions with these new ones
function blink() {
  const eyes = document.getElementById("characterEyes");
  const currentSrc = eyes.src;

  // Store the open eyes source for reference
  if (!eyes.dataset.openEyes) {
    eyes.dataset.openEyes = currentSrc;
  }

  // Blink animation sequence
  eyes.src = "asset/mata tertutup.svg";
  setTimeout(() => {
    eyes.src = eyes.dataset.openEyes;
  }, 150); // Eyes stay closed for 150ms
}

function startRandomBlinking() {
  setInterval(() => {
    if (Math.random() < 0.2) {
      // 20% chance to blink
      blink();
    }
  }, 1000); // Check every 3 seconds
}

// Start the blinking when the page loads
document.addEventListener("DOMContentLoaded", () => {
  startRandomBlinking();
});

// Prevent form submission if not verified
document.querySelector("form")?.addEventListener("submit", (e) => {
  if (!isVerified) {
    e.preventDefault();
    alert("Silakan selesaikan CAPTCHA emosional terlebih dahulu!");
  }
});
