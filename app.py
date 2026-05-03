from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql

app=Flask(__name__)
CORS(app)

def get_db():
    return pymysql.connect(
        host="tramway.proxy.rlwy.net",
        user="root",
        password="qwIHBdbUGGOYkGVSyRKpStlSMnMCxoyT",   # ← paste here
        database="railway",
        port=29324,
        connect_timeout=10
    )

@app.route('/init-db')
def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100),
        email VARCHAR(100),
        password VARCHAR(100)
    )
    """)

    # Expenses table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        title VARCHAR(255),
        amount FLOAT,
        type ENUM('income','expense'),
        date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

    return "Tables created!"

@app.route('/')
def home():
    return "Api is working !"

@app.route('/login', methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id, username, email, password FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()

    if not user:
        return jsonify({
            "success": False,
            "message": "User not found"
        }), 401

    if password != user[3]:   # ✅ FIX HERE
        return jsonify({
            "success": False,
            "message": "Wrong password"
        }), 401

    return jsonify({
        "success": True,
        "user_id": user[0],
        "username": user[1],
        "email": user[2]
    }), 200

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "message": "No data received"}), 400
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    existing_user = cursor.fetchone()

    if existing_user:
        conn.close()
        return jsonify({
            "success": False,
            "message": "User already exists"
        }), 400

    cursor.execute("INSERT INTO users(username, email, password) VALUES (%s,%s,%s)",
        (username, email, password))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Signup Successful"
    }), 201

@app.route('/add-expense', methods=['POST'])
def add_expense():
    data=request.get_json()

    user_id= data.get("user_id")
    title= data.get("title")
    amount= data.get("amount")
    type_= data.get("type")
    date= data.get("date")

    conn=get_db()
    cursor=conn.cursor()

    cursor.execute("INSERT INTO expenses(user_id, title, amount, type, date) VALUES (%s,%s,%s,%s,%s)",
        (user_id, title, amount, type_, date))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Expense added"
    }), 201

@app.route('/expenses/<int:user_id>', methods=['GET'])
def get_expenses(user_id):
    conn=get_db()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    cursor.execute("SELECT * FROM expenses WHERE user_id=%s ORDER BY date DESC",
        (user_id,))
    expenses = cursor.fetchall()
    conn.close()

    return jsonify({
        "success": True,
        "data": expenses
    })

@app.route('/delete-expense/<int:id>', methods=['DELETE'])
def delete_expense(id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM expenses WHERE id=%s", (id,))
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Expense deleted"
    })

# Monthly expenses API
@app.route('/monthly-expenses/<int:user_id>/<int:year>/<int:month>', methods=['GET'])
def monthly_expenses(user_id, year, month):
    conn = get_db()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    query = """
        SELECT * FROM expenses
        WHERE user_id=%s 
        AND YEAR(date)=%s 
        AND MONTH(date)=%s
        ORDER BY date DESC
    """

    cursor.execute(query, (user_id, year, month))
    data = cursor.fetchall()
    conn.close()

    return jsonify({
        "success": True,
        "data": data
    })

if __name__=='__main__':
    app.run(debug=True)