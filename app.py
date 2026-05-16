import os
from flask import Flask, render_template, request, jsonify
from utils import process_pdf, query_rag
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB limit

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file and file.filename.endswith('.pdf'):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        try:
            process_pdf(file_path)
            return jsonify({"message": "File uploaded and processed successfully."}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Invalid file type. Please upload a PDF."}), 400

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message')
    if not message:
        return jsonify({"error": "No message provided"}), 400
    
    response = query_rag(message)
    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
