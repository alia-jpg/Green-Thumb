from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

status = {"moisture": "unknown", "command": "none"}

@app.route("/")
def home():
    return render_template("greenthumb_home.html")

@app.route("/plants")
def plants():
    return render_template("greenthumb_plants.html")

@app.route("/tips")
def tips():
    return render_template("greenthumb_tips.html")

@app.route("/update_status", methods=["POST"])
def update_status():
    data = request.json
    status["moisture"] = data.get("moisture", "unknown")
    return jsonify({"message": "Status updated"}), 200

@app.route("/get_command")
def get_command():
    return jsonify({"command": status["command"]})

@app.route("/set_command", methods=["POST"])
def set_command():
    data = request.json
    status["command"] = data.get("command", "none")
    return jsonify({"message": "Command updated"}), 200

if __name__ == "__main__":
    app.run(debug=True)
