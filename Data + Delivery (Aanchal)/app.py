from pymongo import MongoClient
from flask import Flask, render_template, jsonify 
import pandas as pd 
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

client = MongoClient('mongodb://localhost:27017')
db = client.project3
collection = db.Passengers

@app.route("/api/v1.0/passengers")
def passengers():
    results = pd.DataFrame(collection.find({}, {"_id": 0, "id": 0})).to_dict(orient="list")
    return jsonify(results)

#@app.route("/")
#def home():

#@app.route("/dashboard")
#def dashboard():
    #return render_template("dashboard.html", title="Dashboard")



if __name__ == "__main__":
    app.run(debug=True)
