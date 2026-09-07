# This is our Python backend.
# Flask makes it possible for the browser to talk to Python.
# SQLite stores our courses in one small local database file.

from flask import Flask, jsonify, request, send_from_directory
import sqlite3
import os

# The empty static URL means /style.css and /app.js work directly.
# This matches the simple links inside index.html.
app = Flask(__name__, static_folder="public", static_url_path="")
DATABASE_NAME = "learning.db"


# This opens our database.
def get_database():
    database = sqlite3.connect(DATABASE_NAME)
    database.row_factory = sqlite3.Row
    return database


# This creates the courses table the first time we run the app.
def set_up_database():
    database = get_database()
    database.execute("""
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            subject TEXT NOT NULL,
            lessons INTEGER NOT NULL,
            progress INTEGER NOT NULL,
            color TEXT NOT NULL
        )
    """)

    number_of_courses = database.execute("SELECT COUNT(*) FROM courses").fetchone()[0]

    if number_of_courses == 0:
        database.executemany(
            "INSERT INTO courses (title, subject, lessons, progress, color) VALUES (?, ?, ?, ?, ?)",
            [
                ("Introduction to Artificial Intelligence", "Computer Science", 8, 64, "purple"),
                ("Climate Change and Our Future", "Environmental Science", 6, 32, "green")
            ]
        )

    database.commit()
    database.close()


# This sends the frontend page to the browser.
@app.route("/")
def home_page():
    return send_from_directory("public", "index.html")


# This gives all courses to the frontend.
@app.route("/api/courses", methods=["GET"])
def get_courses():
    database = get_database()
    rows = database.execute("SELECT * FROM courses ORDER BY id DESC").fetchall()
    database.close()
    return jsonify([dict(row) for row in rows])


# This creates a new course from the topic typed by the student.
@app.route("/api/courses", methods=["POST"])
def create_course():
    data = request.get_json()
    topic = data.get("topic", "New Learning Course")

    database = get_database()
    database.execute(
        "INSERT INTO courses (title, subject, lessons, progress, color) VALUES (?, ?, ?, ?, ?)",
        (topic, "AI Generated", 5, 0, "orange")
    )
    database.commit()
    new_course = database.execute("SELECT * FROM courses ORDER BY id DESC LIMIT 1").fetchone()
    database.close()
    return jsonify(dict(new_course)), 201


if __name__ == "__main__":
    set_up_database()
    app.run(debug=True, port=3000)
