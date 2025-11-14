from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

# Load environment vars
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise Exception("Set GROQ_API_KEY environment variable")

client = Groq(api_key=GROQ_API_KEY)


@app.route("/generate", methods=["POST"])
def generate_post():
    data = request.json
    topic = data.get("topic", "")
    tone = data.get("tone", "Fun")
    platform = data.get("platform", "Instagram")

    # AI prompt
    prompt = f"""
Write a {tone} social media post for {platform} about "{topic}".
Include:
1. Creative caption (1-3 lines)
2. 5 trending hashtags
3. Short CTA (call to action)
Return strictly in this format:

Caption: <your caption>

Hashtags: <your hashtags>

CTA: <your CTA>
"""

    try:
        # GROQ model call
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",  # FAST & FREE
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=300,
        )

        ai_output = response.choices[0].message.content
        print("\n=== RAW AI OUTPUT ===")
        print(ai_output)

        # Initialize values
        caption = ""
        hashtags = ""
        cta = ""

        # Parse line by line
        for line in ai_output.split("\n"):
            clean = line.strip()
            lower = clean.lower()

            # caption
            if lower.startswith("caption:"):
                caption = clean.split(":", 1)[1].strip()

            # hashtags (any format)
            elif lower.startswith("hashtags:"):
                hashtags = clean.split(":", 1)[1].strip()

            # CTA
            elif lower.startswith("cta:") or "call to action" in lower:
                cta = clean.split(":", 1)[1].strip()

            # If hashtags appear without label
            elif "#" in clean:
                words = [w.strip(",") for w in clean.split() if w.startswith("#")]
                if words:
                    hashtags = " ".join(words)

        # FINAL fallback (extract hashtags anywhere)
        if not hashtags:
            words = [w.strip(",") for w in ai_output.split() if w.startswith("#")]
            hashtags = " ".join(words)

        # If CTA missing, fallback from AI last line
        if not cta:
            for line in reversed(ai_output.split("\n")):
                if "!" in line or "?" in line or "please" in line.lower():
                    cta = line.strip()
                    break

        return jsonify({
            "caption": caption,
            "hashtags": hashtags,
            "cta": cta,
            "raw": ai_output
        })

    except Exception as e:
        print("Backend Error:", str(e))
        return jsonify({"error": str(e)}), 500


# RUN SERVER
port = int(os.environ.get("PORT", 8000))
app.run(host="0.0.0.0", port=port)

