import base64
from flask import Flask, jsonify, abort, make_response,request, json, redirect

app = Flask(__name__)

@app.route('/saveimg', methods=["POST"])
def index():
    if request.method == "POST":
        print(request)
        '''imgdata = base64.b64decode(imgstring)
        filename = 'some_image1.jpg'  # I assume you have a way of picking unique filenames
        with open(filename, 'wb') as f:
            f.write(imgdata)'''

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8837, threaded=True)