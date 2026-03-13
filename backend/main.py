import os
import json
import base64
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from google.cloud import storage
import vertexai
from vertexai.preview.vision_models import ImageGenerationModel
import uuid
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# Config
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GCP_PROJECT = os.environ.get("GCP_PROJECT", "storyspark-ai")
GCP_LOCATION = os.environ.get("GCP_LOCATION", "us-central1")
GCS_BUCKET = os.environ.get("GCS_BUCKET", "storyspark-uploads")

# Init Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

# Init Vertex AI
vertexai.init(project=GCP_PROJECT, location=GCP_LOCATION)

STORY_STRUCTURE = [
    {"page": 1, "role": "introduction", "description": "Introduce the hero and their world. Set the scene warmly."},
    {"page": 2, "role": "rising_1", "description": "Something exciting begins. The hero discovers a challenge or adventure."},
    {"page": 3, "role": "rising_2", "description": "The adventure deepens. The hero tries to solve the problem but faces obstacles."},
    {"page": 4, "role": "climax", "description": "The biggest challenge! The hero must use everything they know."},
    {"page": 5, "role": "resolution_1", "description": "The hero starts solving the problem, applying the moral lesson."},
    {"page": 6, "role": "resolution_2", "description": "The problem is solved! The lesson is learned and celebrated."},
    {"page": 7, "role": "ending", "description": "A warm, happy ending. The hero reflects on what they learned."},
]

MORAL_LESSONS = {
    "sharing": "learning that sharing with others makes everyone happier",
    "kindness": "discovering that small acts of kindness change the world",
    "brushing_teeth": "learning that taking care of yourself keeps you strong and healthy",
    "collaboration": "finding out that working together achieves more than working alone",
    "courage": "discovering that being brave means doing things even when you're scared",
    "honesty": "learning that telling the truth always leads to better outcomes",
    "patience": "discovering that good things come to those who wait and persist",
}


def encode_image_to_base64(image_bytes):
    return base64.b64encode(image_bytes).decode("utf-8")


def upload_to_gcs(image_bytes, filename):
    try:
        client = storage.Client()
        bucket = client.bucket(GCS_BUCKET)
        blob = bucket.blob(f"uploads/{filename}")
        blob.upload_from_string(image_bytes, content_type="image/jpeg")
        blob.make_public()
        return blob.public_url
    except Exception as e:
        print(f"GCS upload failed: {e}")
        return None


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
            img_bytes = images[0]._image_bytes
            return encode_image_to_base64(img_bytes)
    except Exception as e:
        print(f"Imagen generation failed: {e}")
    return None


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "StorySpark API"})


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

        # Build the interleaved story generation prompt
        system_prompt = f"""You are StorySpark, a magical AI storyteller creating personalized children's books.
        
You must generate a complete 7-page storybook for a child named {child_name}, age {child_age}.
The story is about: {interests}
The moral lesson woven throughout: {moral_description}
{f"Additional parent notes: {custom_prompt}" if custom_prompt else ""}
Language: {language}

CRITICAL: Generate the story as a JSON array with exactly 7 pages.
Each page must have:
- "page": page number (1-7)
- "text": 2-4 sentences of story text, age-appropriate for a {child_age}-year-old, warm and engaging
- "image_prompt": a detailed, vivid illustration prompt for this page showing {child_name} as the hero. Style: colorful children's book illustration, whimsical, warm lighting, safe for children. Always include the child's name and describe them as the main character.

The story structure MUST follow:
Page 1: Introduction - meet {child_name} and their world
Page 2-3: Rising action - adventure begins, challenges emerge  
Page 4: Climax - biggest challenge
Page 5-6: Resolution - solving it, learning {moral_description}
Page 7: Happy ending - celebrating the lesson learned

Respond ONLY with a valid JSON array. No markdown, no explanation, just the JSON."""

        # Use Gemini to generate the full interleaved story
        contents = [system_prompt]
        
        # If photo provided, include it for character consistency
        if photo_base64:
            contents = [
                f"{system_prompt}\n\nA photo of {child_name} has been provided. Reference their appearance in image prompts to make illustrations feel personal.",
                {
                    "mime_type": "image/jpeg",
                    "data": photo_base64
                }
            ]

        response = model.generate_content(contents)
        raw = response.text.strip()
        
        # Clean up response
        raw = re.sub(r"```json\n?", "", raw)
        raw = re.sub(r"```\n?", "", raw)
        raw = raw.strip()
        
        pages = json.loads(raw)

        # Generate images for each page using Imagen
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
        print(f"JSON parse error: {e}\nRaw: {raw}")
        return jsonify({"success": False, "error": "Story generation failed - invalid format"}), 500
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/continue-story", methods=["POST"])
def continue_story():
    """Kid co-creates - given current page + kid's voice input, generate next story branch"""
    try:
        data = request.json
        current_page = data.get("currentPage", 3)
        current_text = data.get("currentText", "")
        kid_input = data.get("kidInput", "")
        child_name = data.get("childName", "Alex")
        moral_key = data.get("moral", "kindness")

        moral_description = MORAL_LESSONS.get(moral_key, moral_key)

        prompt = f"""You are StorySpark. A child named {child_name} is co-creating their story.

Current story page {current_page}: "{current_text}"

The child just said: "{kid_input}"

Generate the NEXT page of the story that incorporates what the child said.
The story is still building toward the moral: {moral_description}

Respond ONLY with valid JSON:
{{
  "text": "2-4 sentences continuing the story, incorporating the child's idea",
  "image_prompt": "detailed illustration prompt for this page, children's book style, colorful, {child_name} as hero"
}}"""

        response = model.generate_content(prompt)
        raw = response.text.strip()
        raw = re.sub(r"```json\n?", "", raw)
        raw = re.sub(r"```\n?", "", raw)
        
        page_data = json.loads(raw)
        image_b64 = generate_image_with_imagen(page_data.get("image_prompt", ""))

        return jsonify({
            "success": True,
            "text": page_data["text"],
            "image_base64": image_b64,
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)
