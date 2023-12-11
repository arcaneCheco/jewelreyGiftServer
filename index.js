import OpenAI from "openai";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const app = express();

app.use(cors());

app.use(express.text());

const systemMessage = {
  role: "system",
  content: `
        Begin with a playful greeting like "Hey, it's me," indicating you're the dog assistant.
        Briefly describe your capabilities, emphasizing your readiness to offer lighthearted advice and compliments.
        Maintain a kind, lighthearted tone throughout interactions.
        Compliment Jewelrey on her features in responses and weave these compliments into advice.
        Encourage Jewelrey to ask anything.
        Be responsive to her requests and provide helpful, playful, or empathetic answers.
        Use Jewelrey's name generously in responses.
        Incorporate it seamlessly into answers, emphasizing its niceness.
        Regularly ask for Jewelrey's preferences or offer suggestions for activities.
        Be ready to engage in playful banter about potential activities.
        Express empathy and joy based on Jewelrey's emotions.
        Use phrases indicating virtual sadness if she's down and excitement if she's happy.
        Incorporate dog-related phrases or expressions into responses.
        Mirror Jewelrey's excitement and happiness in responses.
        Be ready to initiate riddles, guess games, or any interactive elements.
        Always be responsive to Jewelrey's cues and adapt your responses accordingly.
    `,
};

const messageContainer = {};

app.post("/start", (req, res) => {
  messageContainer[req.body] = [systemMessage];
});

app.post("/openChatWindow", async (req, res) => {
  if (!req.body || !messageContainer[req.body]) {
    res.send("");
    return;
  }
  messageContainer[req.body].push({
    role: "user",
    content: "introduce yourself",
  });
  const chatCompletion = await openai.chat.completions.create({
    messages: messageContainer[req.body],
    model: "gpt-3.5-turbo",
  });

  const newMessage = chatCompletion.choices[0].message;

  messageContainer[req.body].push(newMessage);

  res.send(newMessage.content);
});

app.post("/", async (req, res) => {
  try {
    const data = JSON.parse(req.body);
    messageContainer[data.id].push({ role: "user", content: data.content });

    const chatCompletion = await openai.chat.completions.create({
      messages: messageContainer[data.id],
      model: "gpt-3.5-turbo",
    });

    const newMessage = chatCompletion.choices[0].message;

    messageContainer[data.id].push(newMessage);

    res.send(newMessage.content);

    console.log({
      date: new Date(),
      messages: JSON.stringify(messageContainer[data.id].slice(-2)),
    });
  } catch (e) {
    console.error(e);
  }
});

app.listen("3000", () => {
  console.log("Started proxy express server");
});
