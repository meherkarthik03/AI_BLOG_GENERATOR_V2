from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

app = Flask(__name__)
CORS(app)

# Load AI Model (GPT-based)
blog_generator = pipeline(
    "text-generation", 
    model="EleutherAI/gpt-neo-125M"
)

@app.route("/generate", methods=["POST"])
def generate_blog():
    try:
        data = request.json
        topic = data.get("topic", "").strip()

        if not topic:
            return jsonify({"error": "Topic is required"}), 400

        # Generate AI-powered blog content
        generated_output = blog_generator(
            topic,
            max_length=300,
            num_return_sequences=1,
            temperature=0.8,
            top_p=0.9,
            top_k=50,
            repetition_penalty=1.8
        )

        generated_blog = generated_output[0]["generated_text"]

        return jsonify({"blog": generated_blog})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

