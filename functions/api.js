<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shine Digital Store - Post</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        body {
            background-color: #f4f6f9;
            color: #333;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #fff;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        h2 {
            margin-bottom: 20px;
            color: #1a73e8;
            text-align: center;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
        }
        input[type="text"], textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 15px;
            outline: none;
            transition: border 0.3s;
        }
        input[type="text"]:focus, textarea:focus {
            border-color: #1a73e8;
        }
        input[type="file"] {
            display: none;
        }
        .file-label {
            display: inline-block;
            padding: 10px 20px;
            background-color: #e8f0fe;
            color: #1a73e8;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            margin-top: 5px;
            transition: background 0.3s;
        }
        .file-label:hover {
            background-color: #d2e3fc;
        }
        .preview-container {
            margin-top: 10px;
            text-align: center;
        }
        .preview-container img, .preview-container video {
            max-width: 100%;
            max-height: 200px;
            border-radius: 8px;
            display: none;
        }
        .btn-submit {
            width: 100%;
            padding: 14px;
            background-color: #1a73e8;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.3s;
        }
        .btn-submit:hover {
            background-color: #1557b0;
        }
        .btn-submit:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        .status-msg {
            margin-top: 15px;
            text-align: center;
            font-weight: 500;
        }
    </style>
</head>
<body>

<div class="container">
    <h2>Create New Post</h2>
    <form id="postForm">
        <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" placeholder="Enter your name" required>
        </div>
        <div class="form-group">
            <label for="message">Message</label>
            <textarea id="message" rows="4" placeholder="What's on your mind?" required></textarea>
        </div>
        <div class="form-group">
            <label>Media (Photo / Video)</label>
            <label for="fileInput" class="file-label">Choose File</label>
            <input type="file" id="fileInput" accept="image/*,video/*">
            <div class="preview-container">
                <span id="file-name-display" style="display:block; margin-bottom:5px; font-size:14px; color:#666;"></span>
                <img id="imagePreview" alt="Preview">
                <video id="videoPreview" controls></video>
            </div>
        </div>
        <button type="submit" id="submitBtn" class="btn-submit">Submit Post</button>
        <div id="statusMsg" class="status-msg"></div>
    </form>
</div>

<script>
    const fileInput = document.getElementById('fileInput');
    const imagePreview = document.getElementById('imagePreview');
    const videoPreview = document.getElementById('videoPreview');
    const fileNameDisplay = document.getElementById('file-name-display');
    const postForm = document.getElementById('postForm');
    const submitBtn = document.getElementById('submitBtn');
    const statusMsg = document.getElementById('statusMsg');

    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        imagePreview.style.display = 'none';
        videoPreview.style.display = 'none';
        fileNameDisplay.textContent = '';

        if (file) {
            fileNameDisplay.textContent = file.name;
            const reader = new FileReader();
            
            if (file.type.startsWith('image/')) {
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                }
                reader.readAsDataURL(file);
            } else if (file.type.startsWith('video/')) {
                const fileURL = URL.createObjectURL(file);
                videoPreview.src = fileURL;
                videoPreview.style.display = 'block';
            }
        }
    });

    postForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const message = document.getElementById('message').value;
        const file = fileInput.files[0];
        
        submitBtn.disabled = true;
        statusMsg.style.color = '#666';
        statusMsg.textContent = 'Uploading media and submitting post...';

        let mediaUrl = '';

        try {
            if (file) {
                const formData = new FormData();
                formData.append('file', file);

                const uploadResponse = await fetch('/api?action=upload', {
                    method: 'POST',
                    body: formData
                });

                if (!uploadResponse.ok) {
                    throw new Error('Media upload failed.');
                }

                const uploadResult = await uploadResponse.json();
                mediaUrl = uploadResult.url;
            }

            const messageResponse = await fetch('/api?action=messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    message: message,
                    media_url: mediaUrl
                })
            });

            if (!messageResponse.ok) {
                throw new Error('Message submission failed.');
            }

            statusMsg.style.color = '#28a745';
            statusMsg.textContent = 'Post created successfully!';
            postForm.reset();
            imagePreview.style.display = 'none';
            videoPreview.style.display = 'none';
            fileNameDisplay.textContent = '';

        } catch (error) {
            statusMsg.style.color = '#dc3545';
            statusMsg.textContent = 'Error: ' + error.message;
        } finally {
            submitBtn.disabled = false;
        }
    });
</script>

</body>
</html>
