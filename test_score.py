import requests
import json

# The URL where your Flask app is running
URL = "http://127.0.0.1:5000/get-score"

# Sample data to test the SBERT similarity
test_data = {
    "model_answer": "The heart is a muscular organ that pumps blood through the circulatory system.",
    "student_answer": "The heart is a muscle that sends blood around the body."
}

print("--- Sending Test Data to SBERT Backend ---")
try:
    response = requests.post(URL, json=test_data)
    if response.status_code == 200:
        result = response.json()
        print(f"Success! SBERT Similarity Score: {result['score']}/10")
        
        if result['score'] > 7:
            print("Status: High Similarity detected (Correct Logic).")
        else:
            print("Status: Low Similarity detected.")
    else:
        print(f"Error: Server responded with status code {response.status_code}")
except Exception as e:
    print(f"Connection Failed: Is your app.py running in the other terminal? \nError: {e}")