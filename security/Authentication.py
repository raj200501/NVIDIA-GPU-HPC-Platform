from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'

users = []

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = generate_password_hash(data['password'], method='sha256')
    user = {
        'public_id': len(users) + 1,
        'name': data['name'],
        'password': hashed_password
    }
    users.append(user)
    return jsonify({'message': 'User registered successfully!'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = next((user for user in users if user['name'] == data['name']), None)
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'message': 'Login failed!'}), 401

    token = jwt.encode({
        'public_id': user['public_id'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    }, app.config['SECRET_KEY'], algorithm="HS256")
    return jsonify({'token': token})

@app.route('/secure', methods=['GET'])
def secure():
    token = request.headers.get('x-access-tokens')
    if not token:
        return jsonify({'message': 'Token is missing!'}), 401

    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        user = next((user for user in users if user['public_id'] == data['public_id']), None)
    except:
        return jsonify({'message': 'Token is invalid!'}), 401

    return jsonify({'message': f'Welcome {user["name"]}!'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
