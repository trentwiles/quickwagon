from flask import Flask, jsonify, request
import uuid
import random
import calendar
import time
from datetime import datetime

#
#
# Iterim API Server
# **********************
# The final API will be written in Java Spring. This is a temporary
# AI just to return sample data while the frontend is being developed
#
#

app = Flask(__name__)


# Serves as a "check-auth" route
@app.route("/")
def check_auth():
    if "Authorization" in request.headers:
        return jsonify(username="joe")
    return jsonify(), 401


@app.route("/me")
def auth_details():
    if "Authorization" in request.headers:
        return jsonify(
            name="Trenty Poo",
            email="admin@trentwil.es",
            avatar="https://trentwil.es/a/KfKCobXBG0.png",
            privledge_level="Dasher",
        )
    return jsonify(err_msg="Unauthorized"), 401


@app.route("/me", methods=["PATCH"])
def update_auth_details():
    api = request.get_json()

    if "Authorization" in request.headers and "username" in api:
        return jsonify(new_username=api["username"])

    return jsonify(err_msg="Unauthorized"), 400


orders = [
    {
        "orderTitle": "Sample Order 1",
        "orderItems": [{"Carrot": 1.09, "Apple": 5.12}],
        "client": "Joe",
        "id": "21b0b6f3-f4d6-47e1-ab2b-28717fba84c9",
    },
    {
        "orderTitle": "Sample Order 2",
        "orderItems": [
            {
                "Coca Cola": 3.99,
                "Sprite": 2.99,
                "Chips": 15.99,
                "Forks & Knives": 19.97,
            }
        ],
        "client": "Griffin",
        "id": "fa2a200b-485a-44ae-8817-3e9838055c7b",
    },
    {
        "orderTitle": "Sample Order 3",
        "orderItems": [
            {"Pepsi": 2.49, "Water Bottle": 1.99, "Cookies": 5.49, "Napkins": 3.99}
        ],
        "client": "Roberto",
        "id": "d4c9a7f3-9a4a-4a3e-8b61-e9c024b7ae23",
    },
    {
        "orderTitle": "Sample Order 4",
        "orderItems": [
            {
                "Iced Tea": 2.79,
                "Granola Bar": 1.49,
                "Sandwich": 7.99,
                "Paper Plates": 4.5,
            }
        ],
        "client": "Alexandra",
        "id": "b32c78d6-eec1-4134-b302-7b78c6a841df",
    },
    {
        "orderTitle": "Sample Order 5",
        "orderItems": [
            {
                "Orange Juice": 3.49,
                "Muffin": 2.25,
                "Salad": 9.75,
                "Plastic Cups": 2.89,
            }
        ],
        "client": "Robin",
        "id": "8f74329e-531f-49e2-bd93-8d9c1cbbe9f2",
    },
]


@app.route("/orders")
def test_data():
    # type props = {
    #     orderTitle: string;
    #     orderItems: Map<string, number>;
    #     client: string;
    #     id: string;
    #     // no need for total price/total items, this can be computed from hashmap
    # };

    return jsonify(orders=orders)


@app.route("/getOrder")
def get_order():

    q = request.args.get("q", None)
    if q == None or q == "":
        return jsonify(error=True, error_msg="Please set a search query"), 400

    for o in orders:
        if o["id"] == q:
            return jsonify(o)

    return jsonify(error=True, error_msg="Order not found. Was it deleted?"), 404


# fake API login route
@app.route("/login", methods=["POST"])
def login():
    api = request.get_json()
    if "username" in api and "password" in api:
        if "admin@trentwil.es" == api["username"] and "password" == api["password"]:
            return jsonify(login=True, token=uuid.uuid4(), error_msg="")
        else:
            return jsonify(login=False, error_msg="invalid username/password"), 403
    else:
        return jsonify(login=False, error_msg="Missing username/password"), 400


# fake API logout route (on a real backend, this would destroy the user's token)
@app.route("/logout", methods=["POST"])
def logout():
    # assume the logout token is already in the authentication header
    if "Authorization" in request.headers:
        print(
            "{token} deleted from database @ {ts}".format(
                {request.headers["Authorization"], str(time.time())}
            )
        )
        return jsonify(), 200
    return jsonify(error_msg="failed to remove token on backend"), 400


# fake sales data for a given order fufiller
@app.route("/sales")
def sales():
    sales = []
    sales.append({"month": "January", "value": random.randint(100, 1000)})
    sales.append({"month": "February", "value": random.randint(100, 1000)})
    sales.append({"month": "March", "value": random.randint(100, 1000)})
    sales.append({"month": "April", "value": random.randint(100, 1000)})
    sales.append({"month": "May", "value": random.randint(100, 1000)})
    sales.append({"month": "June", "value": random.randint(100, 1000)})
    sales.append({"month": "July", "value": random.randint(100, 1000)})
    sales.append({"month": "August", "value": random.randint(100, 1000)})
    sales.append({"month": "September", "value": random.randint(100, 1000)})
    sales.append({"month": "October", "value": random.randint(100, 1000)})
    sales.append({"month": "November", "value": random.randint(100, 1000)})
    sales.append({"month": "December", "value": random.randint(100, 1000)})
    return jsonify(sales)


@app.route("/sales/<month>")
def month(month):
    monthToNum = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]

    sales = []
    for day in range(calendar.monthrange(2025, int(month))[1]):
        sales.append(
            {
                "day": (day + 1),
                "orders": random.randint(0, 40),
                "profit": random.randint(0, 40),
            }
        )

    # time delay to test skeleton loader
    time.sleep(3)

    return jsonify(month=monthToNum[int(month) - 1], sales=sales)


@app.route("/search")
def search():

    items = [
        "Apple",
        "Milk",
        "Eggs",
        "Banana",
        "Bread",
        "Butter",
        "Cheese",
        "Chicken",
        "Carrots",
        "Potatoes",
        "Onions",
        "Tomatoes",
        "Lettuce",
        "Cereal",
        "Pasta",
        "Rice",
        "Beans",
        "Yogurt",
        "Orange Juice",
        "Coffee",
        "Tea",
        "Sugar",
        "Salt",
        "Pepper",
        "Olive Oil",
        "Vinegar",
        "Flour",
        "Ground Beef",
        "Fish",
        "Broccoli",
        "Spinach",
        "Cucumbers",
        "Bell Peppers",
        "Garlic",
        "Strawberries",
        "Blueberries",
        "Toilet Paper",
        "Paper Towels",
        "Dish Soap",
        "Laundry Detergent",
    ]

    q = request.args.get("q", None)
    if q == None or q == "":
        return jsonify(error=True, error_msg="Please set a search query"), 400

    return [item for item in items if str(q).lower() in item.lower()]


@app.route("/modOrder", methods=["POST"])
def modOrder():
    api = request.get_json()

    print(api)

    orderID = api.get("orderID", None)

    if orderID == None:
        return jsonify(
            error=True,
            error_msg="Missing orderID param (tip: set orderID to 0 for new order)",
        )

    if orderID == 0:
        orderID = random.randint(1000000, 10000000000)

    items = api.get("orderItems", [])

    estimatedTotal = 0
    if len(items) > 0:
        estimatedTotal = random.random() * random.randint(10, (10 * len(items)))

    tip = 0.20
    estimatedTotalWithTip = estimatedTotal * (1 + tip)

    return jsonify(
        error=False,
        orderID=orderID,
        totalItems=len(items),
        preTipTotal=round(estimatedTotal, 2),
        tip=str(tip * 100) + "%",
        postTipTotal=round(estimatedTotalWithTip, 2),
    )


@app.route("/submitOrder", methods=["POST"])
def submitOrder():
    # No need to resubmit order items, we already have that saved in the database from the modOrders method

    api = request.get_json()

    print(api)

    orderID = api.get("orderID", None)
    if orderID == None:
        return jsonify(
            error=True, error_msg="Missing orderID param (use modOrder to get a new ID)"
        )

    return jsonify(error=False, orderID=orderID)


@app.route("/getOrderTrackingStatus")
def trackOrder():
    # enum Status {
    #   Preparing,
    #   Collecting,
    #   Awaiting,
    #   Completed,
    # }

    orders = [
        {
            "orderID": "6f407e6f-dcb4-42f1-a0c5-1e7cc36473d8",
            "status": "Collecting",
            "verbose": {
                "placed_time": datetime(2025, 2, 16, 14, 9, 0).strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
                "assignment_time": datetime(2025, 2, 16, 16, 55, 0).strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
                "accepted_by": "david",
            },
            "notes": "",
        },
        {
            "orderID": "3d3a62ec-25f8-4bb9-b9cb-2f79c37642f4",
            "status": "Awaiting",
            "verbose": {
                "placed_time": datetime(2025, 3, 31, 3, 28, 0).strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
                "assignment_time": datetime(2025, 3, 31, 7, 55, 0).strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
                "accepted_by": "david",
                "fufillment_time": datetime(2025, 3, 31, 23, 23, 0).strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
            },
            "notes": "",
        },
        {
            "orderID": "21b0b6f3-f4d6-47e1-ab2b-28717fba84c9",
            "status": "Preparing",
            "verbose": {
                "placed_time": datetime(2025, 3, 31, 3, 28, 0).strftime(
                    "%Y-%m-%d %H:%M:%S"
                )
            },
            "notes": "",
        },
        {
            "orderID": "fa2a200b-485a-44ae-8817-3e9838055c7b",
            "status": "Collecting",
            "verbose": {
                "placed_time": datetime(2025, 2, 16, 14, 9, 0).strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
                "assignment_time": datetime(2025, 2, 16, 16, 55, 0).strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
                "accepted_by": "david",
            },
            "notes": "",
        },
        {
            "orderID": "d4c9a7f3-9a4a-4a3e-8b61-e9c024b7ae23",
            "status": "Awaiting",
            "verbose": {
                "placed_time": datetime(2025, 3, 31, 3, 28, 0).strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
                "assignment_time": datetime(2025, 3, 31, 7, 55, 0).strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
                "accepted_by": "david",
                "fufillment_time": datetime(2025, 3, 31, 23, 23, 0).strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
            },
            "notes": "",
        },
        {
            "orderID": "b32c78d6-eec1-4134-b302-7b78c6a841df",
            "status": "Completed",
            "verbose": {
                "placed_time": datetime(2025, 4, 1, 15, 30, 0).strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
                "assignment_time": datetime(2025, 4, 1, 15, 30, 0).strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
                "accepted_by": "david",
                "fufillment_time": datetime(2025, 4, 1, 19, 23, 0).strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
                "pickup_time": datetime(2025, 4, 1, 22, 3, 0).strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
            },
            "notes": "",
        },
    ]

    q = request.args.get("q", None)
    if q == None or q == "":
        return jsonify(error=True, error_msg="Please set an order to track"), 400

    for order in orders:
        if order["orderID"] == q:
            return jsonify(order=order)

    return jsonify(error=True, error_msg="orderID not found, was it deleted?"), 404


@app.route("/takenOrdersAndPossibleOrders")
def availableOrders():
    # Same exact format as /orders
    # Available for dashers only
    available = [
        {
            "orderTitle": "Available Order 1",
            "orderItems": [{"Milk": 4.59, "Cheese": 15.12}],
            "client": "Alexander",
            "id": "3d3a62ec-25f8-4bb9-b9cb-2f79c37642f4",
        },
        {
            "orderTitle": "Available Order 2",
            "orderItems": [
                {
                    "Green Beans": 14.38,
                    "Water": 1.12,
                    "Coca-Cola": 10.74,
                    "Potatoes": 7.29,
                }
            ],
            "client": "Richard",
            "id": "6f407e6f-dcb4-42f1-a0c5-1e7cc36473d8",
        },
    ]
    return jsonify(availableOrders=available, acceptedOrders=available)


@app.route("/negociateOrder", methods=["POST"])
def acceptOrder():
    # orderID -> ID of the order
    # status -> true if dasher accepts, false if dasher declines
    # curl -X POST localhost/negociateOrder -d '{"orderID": "12345", "status": true}'
    api = request.get_json()
    if "orderID" in api and "status" in api:
        if api["status"] != True and api["status"] != False:
            return (
                jsonify(error=True, error_msg="`status` must be of type boolean"),
                400,
            )
        return jsonify(error=False), 200
    return jsonify(error=True, error_msg="Missing 'orderID'/'status' in JSON body"), 400


@app.route("/searchPages", methods=["POST"])
def searchPages():
    # in production this will pull from a precompiled list from all pages
    # this is just a demo so i'm using a fixed list
    pages = [
        {"title": "Home", "path": "/"},
        {"title": "Orders", "path": "/orders"},
        {"title": "Support", "path": "/support"},
    ]

    api = request.get_json()
    if "q" not in api:
        return jsonify(error=True, error_msg="please set a search query 'q'")

    return jsonify([item for item in pages if str(q).lower() in item["title"].lower()])


if __name__ == "__main__":
    app.run(debug=True)
