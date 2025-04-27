# **App Name**: SkinDeep AI

## Core Features:

- Image Upload: Allow users to upload face images for analysis. The file should be validated to ensure it is an image (.jpg, .jpeg, .png).
- Disease Prediction: Use a pre-trained or custom-trained AI model tool to classify the uploaded image into one of the following categories: Acne, Eczema, Psoriasis, Vitiligo, Melanoma. Display the predicted disease name and confidence percentage.
- Result Visualization: Display results with disease name and probability.

## Style Guidelines:

- Primary color: Soft blue (#B0E2FF) to convey trust and health.
- Secondary color: Light gray (#F0F0F0) for backgrounds and neutral elements.
- Accent: Teal (#008080) for highlighting important information and interactive elements.
- Clean, minimalist design with a focus on readability and ease of use.
- Use clear, simple icons to represent different diseases and actions.
- Subtle transitions and animations to provide feedback and guide the user.

## Original User Request:
Create a Vision AI service to detect facial skin diseases from uploaded images.

Requirements:
- Input: A face image uploaded by the user.
- Resize uploaded images to 224x224 pixels.
- Normalize pixel values (scale between 0 to 1).
- Pass the image to a trained deep learning model OR use Vision AI's pretrained image classification capabilities.

The service should predict and classify the image into one of the following categories:
- Acne
- Eczema
- Psoriasis
- Vitiligo
- Melanoma

Output Response:
- Predicted Disease Name (string)
- Confidence Percentage (float, rounded to two decimal places)

Other Conditions:
- Validate the uploaded file to ensure it is an image (.jpg, .jpeg, .png).
- If the file is invalid, return a user-friendly error message: "Invalid File! Please upload a valid face image."
- Deploy the model/API as a REST endpoint accessible by the frontend.
  