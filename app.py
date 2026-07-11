from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
import os
import bcrypt
import jwt
import datetime
from functools import wraps
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000",
    # "https://expense-tracker-mu-woad.vercel.app",
    "http://13.207.189.198:3000"
])
app.config["PROPAGATE_EXCEPTIONS"] = True
# JWT Config
# JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", "24"))  # Default to 24 hours if not set
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET environment variable is not set!")



#  DB Connection 
def get_db():
    """
    Supports both:
    - Single Railway DATABASE_URL: mysql://user:pass@host:port/dbname
    - Individual env vars: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
    """
    database_url = os.getenv("MYSQL_URL") or os.getenv("DATABASE_URL")

    if database_url:
        parsed = urlparse(database_url)
        host = parsed.hostname
        user = parsed.username
        password = parsed.password
        database = parsed.path.lstrip("/")
        port = parsed.port or 3306
    else:
        host = os.getenv("DB_HOST")
        user = os.getenv("DB_USER")
        password = os.getenv("DB_PASSWORD")
        database = os.getenv("DB_NAME")
        port_str = os.getenv("DB_PORT", "3306")
        port = int(port_str) if port_str else 3306

    return pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=database,
        port=port,
        connect_timeout=10,
        cursorclass=pymysql.cursors.DictCursor
    )


#  JWT Auth Decorator 
def token_required(f):
    """
    Protect any route by adding @token_required above it.
    Expects: Authorization: Bearer <token> header.
    Injects decoded `current_user` dict into the route function.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({"success": False, "message": "Token missing or malformed"}), 401

        token = auth_header.split(" ")[1]

        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "message": "Token expired, please login again"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "message": "Invalid token"}), 401

        return f(payload, *args, **kwargs)

    return decorated


#  Routes 
@app.route('/')
def home():
    return "Api is working !"


@app.route('/init-db')
def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # password is VARCHAR(255) to store bcrypt hash (60 chars but 255 is safe)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount FLOAT NOT NULL,
        type ENUM('income','expense') NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    conn.commit()
    conn.close()
    return jsonify({"message": "Tables created!"})


#  Signup 
@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"success": False, "message": "No data received"}), 400

        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not username or not email or not password:
            return jsonify({"success": False, "message": "All fields are required"}), 400

        if len(password) < 6:
            return jsonify({"success": False, "message": "Password must be at least 6 characters"}), 400

        # Hash password with bcrypt — bcrypt auto-generates a unique salt per user
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({"success": False, "message": "Email already registered"}), 400

        cursor.execute(
            "INSERT INTO users(username, email, password) VALUES (%s, %s, %s)",
            (username, email, hashed_password.decode('utf-8'))
        )
        conn.commit()
        conn.close()

        return jsonify({"success": True, "message": "Signup successful"}), 201

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500


#Login 
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"success": False, "message": "No data received"}), 400

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({"success": False, "message": "Email and password are required"}), 400

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, username, email, password FROM users WHERE email=%s",
            (email,)
        )
        user = cursor.fetchone()
        conn.close()

        if user is None:
            # Vague on purpose — don't reveal whether the email exists
            return jsonify({"success": False, "message": "Invalid email or password"}), 401

        # bcrypt.checkpw handles the salt automatically
        password_matches = bcrypt.checkpw(
            password.encode('utf-8'),
            user["password"].encode('utf-8')
        )

        if not password_matches:
            return jsonify({"success": False, "message": "Invalid email or password"}), 401

        # Build JWT payload — expires in 24 hours
        payload = {
            "user_id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRY_HOURS)
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

        return jsonify({
            "success": True,
            "token": token,
            "user": {
                "user_id": user["id"],
                "username": user["username"],
                "email": user["email"]
            }
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500


#  Add Expense (Protected) 
@app.route('/add-expense', methods=['POST'])
@token_required
def add_expense(current_user):
    try:
        data = request.get_json()

        title = data.get("title", "").strip()
        amount = data.get("amount")
        type_ = data.get("type")
        date = data.get("date")

        if not title or amount is None or not type_ or not date:
            return jsonify({"success": False, "message": "All fields are required"}), 400

        if type_ not in ("income", "expense"):
            return jsonify({"success": False, "message": "Type must be 'income' or 'expense'"}), 400

        try:
            amount = float(amount)
            if amount <= 0:
                raise ValueError()
        except (ValueError, TypeError):
            return jsonify({"success": False, "message": "Amount must be a positive number"}), 400

        # user_id comes from JWT — never trust it from the request body
        user_id = current_user["user_id"]

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO expenses(user_id, title, amount, type, date) VALUES (%s, %s, %s, %s, %s)",
            (user_id, title, amount, type_, date)
        )
        conn.commit()
        conn.close()

        return jsonify({"success": True, "message": "Expense added"}), 201

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500


#  Get All Expenses (Protected) 
@app.route('/expenses', methods=['GET'])
@token_required
def get_expenses(current_user):
    try:
        user_id = current_user["user_id"]  

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM expenses WHERE user_id=%s ORDER BY date DESC",
            (user_id,)
        )
        expenses = cursor.fetchall()
        conn.close()

        return jsonify({"success": True, "data": expenses}), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


#  Delete Expense (Protected) 
@app.route('/delete-expense/<int:expense_id>', methods=['DELETE'])
@token_required
def delete_expense(current_user, expense_id):
    try:
        user_id = current_user["user_id"]

        conn = get_db()
        cursor = conn.cursor()

        # WHERE user_id check prevents deleting another user's expense
        cursor.execute(
            "DELETE FROM expenses WHERE id=%s AND user_id=%s",
            (expense_id, user_id)
        )
        affected = cursor.rowcount
        conn.commit()
        conn.close()

        if affected == 0:
            return jsonify({"success": False, "message": "Expense not found or unauthorized"}), 404

        return jsonify({"success": True, "message": "Expense deleted"}), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# Monthly Expenses (Protected) 
@app.route('/monthly-expenses/<int:year>/<int:month>', methods=['GET'])
@token_required
def monthly_expenses(current_user, year, month):
    try:
        user_id = current_user["user_id"]

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM expenses
            WHERE user_id=%s
            AND YEAR(date)=%s
            AND MONTH(date)=%s
            ORDER BY date DESC
        """, (user_id, year, month))

        data = cursor.fetchall()
        conn.close()

        return jsonify({"success": True, "data": data}), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


#  Run 
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
