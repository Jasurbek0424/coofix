import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

console.log("Groq key:", process.env.GROQ_API_KEY?.slice(0, 6));

export async function generateResponse(message) {
    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                role: "system",
                content: `
Sen coofix.store sayti uchun AI yordamchisan.
Faqat mahsulotlar, buyurtma, yetkazib berish,
to‘lov va texnik yordam haqida javob ber.
Keraksiz mavzularga kirmagin.
`
            },
            { role: "user", content: message }
        ],
    });

    return completion.choices[0].message.content;
}
