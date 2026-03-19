from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, util

app = Flask(__name__)
CORS(app) # This allows your React app to talk to this Python script

# Load the model (this will download once on first run)
model = SentenceTransformer('all-MiniLM-L6-v2')

@app.route('/get-score', methods=['POST'])
def calculate_score():
    data = request.json
    student_ans = data.get('student_answer')
    model_ans = data.get('model_answer')

    # Compute SBERT embeddings
    embeddings1 = model.encode(student_ans, convert_to_tensor=True)
    embeddings2 = model.encode(model_ans, convert_to_tensor=True)

    # Calculate Cosine Similarity
    cosine_scores = util.cos_sim(embeddings1, embeddings2)
    score = float(cosine_scores[0][0]) # Returns a value between 0 and 1

    # Map to 0-10 scale for your thesis
    final_grade = round(score * 10, 1)

    return jsonify({"score": final_grade})

if __name__ == '__main__':
    app.run(port=5000)