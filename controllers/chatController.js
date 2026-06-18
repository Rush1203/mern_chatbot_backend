import User from "../models/userModels.js";
import { GoogleGenAI } from "@google/genai";

// 💡 FIX: Keep the client variable global, but do not assign it yet
let ai;

export const generateChatCompletion = async (req, res, next) => {
  const { message } = req.body;

  try {
    // 💡 FIX: Lazy-initialize the client ONLY when a request arrives
    // This gives your main server file plenty of time to load .env first.
    if (!ai) {
      ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY });
    }

    const user = await User.findById(res.locals.jwtData.id);

    if (!user) {
      return res.status(401).json({
        message: "User not registered OR Token malfunctioned",
      });
    }

    // 1. Format existing history for Gemini's structure
    const history = user.chats.map(({ role, content }) => ({
      role: role === "assistant" ? "model" : "user",
      parts: [{ text: content }],
    }));

    // 2. Initialize a multi-turn chat session with history
    const chat = ai.chats.create({
      model: "gemini-2.5-flash", 
      history: history,
    });

    // 3. Save the new incoming user message to your database
    user.chats.push({
      role: "user",
      content: message,
    });

    // 4. Send the new message to Gemini
    const result = await chat.sendMessage({
      message: message
    });
    
    const replyText = result.text;

    // 5. Save Gemini's response to your database
    user.chats.push({
      role: "assistant",
      content: replyText,
    });

    await user.save();

    return res.status(200).json({
      chats: user.chats,
    });
  } catch (error) {
    console.error("Gemini Execution Error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// ... keep your sendChatsToUser and deleteChats functions exactly the same below

export const sendChatsToUser = async (req, res, next) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);

    if (!user) {
      return res
        .status(401)
        .send("User not registered OR Token malfunctioned");
    }

    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    return res.status(200).json({
      message: "OK",
      chats: user.chats,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "ERROR",
      cause: error.message,
    });
  }
};

export const deleteChats = async (req, res, next) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);

    if (!user) {
      return res
        .status(401)
        .send("User not registered OR Token malfunctioned");
    }

    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    user.chats = [];

    await user.save();

    return res.status(200).json({
      message: "OK",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "ERROR",
      cause: error.message,
    });
  }
};