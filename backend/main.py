import os
import json
import base64
import re
import time
import concurrent.futures
from flask import Flask, request, jsonify
from flask_cors import CORS
import vertexai
from vertexai.generative_models import GenerativeModel, Part
import requests as http_requests
import google.auth
import google.auth.transport.requests

app = Flask(__name__)
CORS(app)

GCP_PROJECT = os.environ.get("GCP_PROJECT", "storyspark-490105")
GCP_LOCATION = os.environ.get("GCP_LOCATION", "us-central1")

vertexai.init(project=GCP_PROJECT, location=GCP_LOCATION)
model = GenerativeModel("gemini-2.5-flash")

MORAL_LESSONS = {
    "sharing": "learning that sharing with others makes everyone happier",
    "kindness": "discovering that small acts of kindness change the world",
    "brushing_teeth": "learning that taking care of yourself keeps you strong and healthy",
    "collaboration": "finding out that working together achieves more than working alone",
    "courage": "discovering that being brave means doing things even when you are scared",
    "honesty": "learning that telling the truth always leads to better outcomes",
    "patience": "discovering that good things come to those who wait and persist",
}

def get_access_token():
    credentials, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
    credentials.refresh(google.auth.transport.requests.Request())
    return credentials.token

def generate_image_with_imagen(prompt, retries=3):
    for attempt in range(retries):
        try:
            token = get_access_token()
            url = f"https://us-central1-aiplatform.googleapis.com/v1/projects/{GCP_PROJECT}/locations/us-central1/publishers/google/models/imagen-4.0-fast-generate-001:predict"
            payload = {
                "instances": [{"prompt": prompt}],
                "parameters": {
                    "sampleCount": 1,
                    "aspectRatio": "4:3",
                    "safetySetting": "block_some",
                    "personGeneration": "allow_all"
                }
            }
            response = http_requests.post(
                url,
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json=payload,
                timeout=60
            )
            result = response.json()
            if "predictions" in result and len(result["predictions"]) > 0:
                b64 = result["predictions"][0].get("bytesBase64Encoded")
                if b64:
                    return b64
            print(f"Empty prediction attempt {attempt+1}: {result}")
        except Exception as e:
            print(f"Imagen attempt {attempt+1} failed: {e}")
        time.sleep(5)
    return None

def get_character_description(photo_base64):
    try:
        prompt = (
            'Look at this child photo. Describe their appearance to create a Pixar-style '
            'animated cartoon character. Use this format exactly: '
            'a cute Pixar animated cartoon child character with [skin tone] skin, '
            '[hair color and style] hair, [eye color] eyes. '
            'Keep it under 25 words. Do not use the word real or photo.'
        )
        parts = [prompt, Part.from_data(data=base64.b64decode(photo_base64), mime_type="image/jpeg")]
        response = model.generate_content(parts)
        return response.text.strip()
    except Exception as e:
        print(f"Appearance extraction failed: {e}")
        return "a cute Pixar animated cartoon child character with warm skin and big expressive eyes"

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "StorySpark API", "project": GCP_PROJECT})

@app.route("/api/generate-story", methods=["POST"])
def generate_story():
    try:
        data = request.json
        child_name = data.get("childName", "Alex")
        child_age = data.get("childAge", "5")
        interests = data.get("interests", "adventure")
        moral_key = data.get("moral", "kindness")
        custom_prompt = data.get("customPrompt", "")
        language = data.get("language", "English")
        photo_base64 = data.get("photoBase64", None)

        moral_description = MORAL_LESSONS.get(moral_key, moral_key)

        if photo_base64:
            character_desc = get_character_description(photo_base64)
        else:
            character_desc = "a cute Pixar animated cartoon child character with big expressive eyes and a warm smile"

        print(f"Character description: {character_desc}")

        system_prompt = f"""You are StorySpark, a magical AI storyteller.

Generate a 7-page storybook JSON for {child_name}, age {child_age}.
Topic: {interests}
Moral: {moral_description}
{f"Notes: {custom_prompt}" if custom_prompt else ""}
Language: {language}

Return ONLY a JSON array. No markdown. No explanation. Just the array.

Each of the 7 objects must have exactly these keys:
- "page": number 1-7
- "text": 3-4 engaging, vivid sentences for age {child_age}
- "image_prompt": beautiful Pixar-style cartoon illustration showing {character_desc} named {child_name} as the hero in the scene. Colorful, warm golden lighting, whimsical storybook style, safe for children, highly detailed.

Pages: 1=intro, 2-3=adventure begins, 4=climax challenge, 5-6=resolution learning {moral_description}, 7=happy ending"""

        response = model.generate_content(system_prompt)
        raw = response.text.strip()
        raw = re.sub(r"```json\n?", "", raw)
        raw = re.sub(r"```\n?", "", raw)
        raw = raw.strip()

        start = raw.find("[")
        end = raw.rfind("]") + 1
        if start != -1 and end > start:
            raw = raw[start:end]

        pages = json.loads(raw)

        def generate_page_image(page_data):
            time.sleep(5)
            image_b64 = generate_image_with_imagen(page_data.get("image_prompt", ""))
            return {
                "page": page_data["page"],
                "text": page_data["text"],
                "image_prompt": page_data.get("image_prompt", ""),
                "image_base64": image_b64,
            }

        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            story_with_images = list(executor.map(generate_page_image, pages))

        story_with_images.sort(key=lambda x: x["page"])

        return jsonify({
            "success": True,
            "story": story_with_images,
            "childName": child_name,
            "moral": moral_key,
            "language": language,
        })

    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}\nRaw: {raw}")
        return jsonify({"success": False, "error": "Story generation failed - invalid format"}), 500
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/continue-story", methods=["POST"])
def continue_story():
    try:
        data = request.json
        current_page = data.get("currentPage", 3)
        current_text = data.get("currentText", "")
        kid_input = data.get("kidInput", "")
        child_name = data.get("childName", "Alex")
        moral_key = data.get("moral", "kindness")
        moral_description = MORAL_LESSONS.get(moral_key, moral_key)

        prompt = (
            f'Continue this childrens story. '
            f'Page {current_page}: "{current_text}" '
            f'Child idea: "{kid_input}" '
            f'Moral: {moral_description} '
            f'Return ONLY JSON: {{"text": "3-4 sentences", "image_prompt": "Pixar cartoon illustration of {child_name} as hero, colorful, warm lighting, storybook style"}}'
        )

        response = model.generate_content(prompt)
        raw = response.text.strip()
        raw = re.sub(r"```json\n?|```\n?", "", raw).strip()
        start = raw.find("{")
        end = raw.rfind("}") + 1
        raw = raw[start:end]
        page_data = json.loads(raw)
        image_b64 = generate_image_with_imagen(page_data.get("image_prompt", ""))

        return jsonify({"success": True, "text": page_data["text"], "image_base64": image_b64})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)
