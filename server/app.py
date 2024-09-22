from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch


app = Flask(__name__)

# Load the model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")

# Initialize chat history globally
chat_history_ids = None

@app.route("/chat", methods=["POST"])
def chat():
    global chat_history_ids
    try:
        # Get the user input from the request body
        user_input = request.json.get("message", "")

        # If no message, return error
        if not user_input:
            return jsonify({"error": "No input provided"}), 400

        # Encode the user input
        new_user_input_ids = tokenizer.encode(user_input + tokenizer.eos_token, return_tensors="pt")

        # Append new user input to chat history
        bot_input_ids = torch.cat([chat_history_ids, new_user_input_ids], dim=-1) if chat_history_ids is not None else new_user_input_ids

        # Generate response
        chat_history_ids = model.generate(bot_input_ids, max_length=1000, pad_token_id=tokenizer.eos_token_id)

        # Decode the bot response
        bot_response = tokenizer.decode(chat_history_ids[:, bot_input_ids.shape[-1]:][0], skip_special_tokens=True)

        # Return the response as JSON
        return jsonify({"response": bot_response})

    except Exception as e:
        # Handle any errors and return a generic error message
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)