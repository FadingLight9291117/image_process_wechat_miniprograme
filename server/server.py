from config import server_config
from process_image import process_image
from flask import Flask, request
from PIL import Image

app = Flask(__name__)


@app.route('/')
def index():
    return '''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Upload Multiple Images</title>
    </head>
    <body>
        <h2>Upload Multiple Images</h2>
        <form action="/upload" method="post" enctype="multipart/form-data">
            <input type="file" name="file" accept="image/*" multiple required>
            <button type="submit">Upload</button>
        </form>
    </body>
    </html>
'''

@app.route('/hello')
def hello():
    return 'Hello, World!'

@app.route('/upload', methods=['POST'])
def upload_image():
    # 获取上传的多个文件
    files = request.files.getlist('file')

    # 检查是否有文件上传
    if not files:
        return 'No file part', 400

    # 存储每个处理后的图像结果
    results = []

    for idx, file in enumerate(files):
        # 使用 Pillow 打开图片
        image = Image.open(file.stream)
        res = process_image(image)
        # 存储图像的字节数组
        results.append(dict(
            id=idx,
            name=file.filename,
            res=res,
        ))

    return results


if __name__ == '__main__':
    app.run(
        debug=True,
        host=server_config['host'],
        port=server_config['port'],
    )
