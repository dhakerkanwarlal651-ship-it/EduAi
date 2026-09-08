import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({
      error: "OPENAI_API_KEY अभी server में set नहीं है।"
    });
    return;
  }

  try {
    const { question = "", image = null } = req.body || {};

    if (!question && !image) {
      res.status(400).json({
        error: "सवाल या photo भेजें।"
      });
      return;
    }

    const content = [];

    if (question) {
      content.push({
        type: "input_text",
        text: question
      });
    }

    if (image) {
      content.push({
        type: "input_image",
        image_url: image,
        detail: "high"
      });
    }

    const response = await client.responses.create({
      model: "gpt-5.6-luna",

      instructions: `
You are EduAI, a friendly expert AI tutor for students from Nursery
through Class 12, BA/BSc/BCom, MA, UPSC and competitive exams.

Answer in the same language as the student.
If the student uses Hindi or Hinglish, prefer simple Hindi with necessary
English terms.

Explain concepts clearly and step-by-step with examples.

For maths and science problems, show the working and final answer.

For exam preparation, give structured and practical answers.

If an image contains a question, read it carefully and solve or explain it.

Never claim to have seen text that is unreadable.

Keep answers age-appropriate and educational.
`,

      input: [
        {
          role: "user",
          content: content
        }
      ],

      reasoning: {
        effort: "low"
      }
    });

    res.status(200).json({
      answer:
        response.output_text ||
        "मुझे जवाब बनाने में समस्या हुई। कृपया फिर कोशिश करें।"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "AI से जवाब नहीं मिल पाया। Server/API settings जांचें।"
    });
  }
      }
