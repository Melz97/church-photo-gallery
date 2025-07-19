import google.generativeai as genai

# Add your secure API key
genai.configure(api_key="AIzaSyA-lZG6PKXroBvJf_zokYvOnZTDl15h9WI")

# Create the model
model = genai.GenerativeModel('gemini-1.5-flash')

# Send a prompt and get the response
print("Sending request to Gemini...")
response = model.generate_content("Explain what a git commit is in simple terms.")

# Print the text from the response
print("Response received!")
print(response.text)