import os
import json
import base64
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import storage
import vertexai
from vertexai.generative_models import GenerativeModel, Part
from vertexai.preview.vision_models import ImageGenerationModel
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

GCP_PROJECT = os.environ.get("GCP_PROJECT", "storyspark-490105")
GCP_LOCATION = os.environ.get("GCP_LOCATION", "us-central1")
GCS_BUCKET = os.environ.get("GCS_BUCKET", "storyspark-uploads-490105")

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

def encode_image_to_base64(image_bytes):
    return base64.b64encode(image_bytes).decode("utf-8")

def generate_image_with_imagen(prompt):
    try:
        imagen_model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-001")
        images = imagen_model.generate_images(
            prompt=prompt,
            number_of_images=1,
            aspect_ratio="4:3",
            safety_filter_level="block_some",
            person_generation="allow_adult",
        )
        if images and len(images) > 0:
            return encode_image_to_base64(images[0]._image_bytes)
    except Exception as e:
        print(f"Imagen generation failed: {e}")
    return None

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

        system_prompt = f"""You are StorySpark, a magical AI storyteller creating personalized children books.

Generate a complete 7-page storybook for a child named {child_name}, age {child_age}.
The story is about: {interests}
The moral lesson: {moral_description}
{f"Additional notes: {custom_prompt}" if custom_prompt else ""}
Language: {language}

Respond ONLY with a valid JSON array with exactly 7 pages.
Each page must have:
- "page": page number (1-7)
- "text": 2-4 sentences, age-appropriate for a {child_age}-year-old
- "image_prompt": detailed illustration prompt showing {child_name} as hero. Style: colorful childrens book illustration, whimsical, warm lighting, safe for children.

Story structure:
Page 1: Introduction
Page 2-3: Rising action
Page 4: Climax
Page 5-6: Resolution
Page 7: Happy ending

Respond ONLY with the JSON array. No markdown, no explanation."""

        contents = [system_prompt]
        if photo_base64:
            image_part = Part.from_data(data=base64.b64decode(photo_base64), mime_type="image/jpeg")
            contents = [f"{system_prompt}\n\nA photo of {child_name} is provided.", image_part]

        response = model.generate_content(contents)
        raw = response.text.strip()
        raw = re.sub(r"```json\n?", "", raw)
        raw = re.sub(r"```\n?", "", raw)
        raw = raw.strip()

        pages = json.loads(raw)

        story_with_images = []
        for page_data in pages:
            image_b64 = generate_image_with_imagen(page_data.get("image_prompt", ""))
            story_with_images.append({
                "page": page_data["page"],
                "text": page_data["text"],
                "image_prompt": page_data.get("image_prompt", ""),
                "image_base64": image_b64,
            })

        return jsonify({
            "success": True,
            "story": story_with_images,
            "childName": child_name,
            "moral": moral_key,
            "language": language,
        })

    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
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

        prompt = f"""StorySpark co-creation. Child named {child_name}.
Current page {current_page}: "{current_text}"
Child said: "{kid_input}"
Generate next page toward moral: {moral_description}

Respond ONLY with JSON:
{{"text": "2-4 sentences", "image_prompt": "illustration prompt, childrens book style, {child_name} as hero"}}"""

        response = model.generate_content(prompt)
        raw = re.sub(r"```json\n?|```\n?", "", response.text.strip()).strip()
        page_data = json.loads(raw)
        image_b64 = generate_image_with_imagen(page_data.get("image_prompt", ""))

        return jsonify({"success": True, "text": page_data["text"], "image_base64": image_b64})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)
