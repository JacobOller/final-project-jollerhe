from pathlib import Path
import sqlite3
import json
from flask import Flask, jsonify, request

import db_functions as db
import insert_static_data as static_inserts

app = Flask(__name__)

# We use this to get the path of the database file. Its more consistent than a hardcoded path.
_REPO_ROOT = Path(__file__).resolve().parent.parent


def get_db_connection():
    db_path = _REPO_ROOT / "data" / "hardware_perf.db"
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn


# Create a new account.
# Returns 201 Created on success, or 400 Bad Request on failure.
@app.post("/api/create-account")
def create_account():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    username = data.get("username")
    password = data.get("password")
    hardware = data.get("hardware")

    # If any of the inputs are empty, then return 400 Bad Request.
    if email is None or username is None or password is None:
        return jsonify({"error": "email, username, and password are required."}), 400
    if not str(email).strip() or not str(username).strip() or password == "":
        return jsonify({"error": "email, username, and password are required"}), 400

    # Optional WMI snapshot — only validated when present (saved once at signup).
    if hardware is not None and not static_inserts.hardware_format_checker(hardware):
        return jsonify({"error": "hardware must match device/components format from WMI JSON"}), 400

    conn = get_db_connection()
    try:
        ok, detail = db.db_create_account(conn, email, username, password)
        hardware_saved = False
        if ok and hardware is not None:
            hardware_saved = static_inserts.insert_static_data(conn, hardware, detail)

        if ok:
            return (
                jsonify(
                    {
                        "message": "Account created successfully",
                        "username": detail,
                        "hardware_saved": hardware_saved if hardware is not None else False,
                    }
                ),
                201,
            )
        return jsonify({"error": detail}), 400
    finally:
        conn.close()


# Login to an existing account.
# Returns 200 OK on success, or 401 Unauthorized on failure.
@app.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}
    username = data.get("username")
    password = data.get("password")

    # If any of the inputs are empty, then return 400 Bad Request.
    if username is None or password is None:
        return jsonify({"error": "username and password are required in JSON body"}), 400
    if not str(username).strip() or password == "":
        return jsonify({"error": "username and password are required"}), 400

    conn = get_db_connection()
    try:
        # Try to login to the account.
        # ok is just 200 OK or 401 Unauthorized.
        ok, detail = db.db_login(conn, username, password)
    finally:
        conn.close()

    # If the login is successful, return 200 OK.
    if ok:
        return (
            jsonify(
                {
                    "message": "Login successful",
                    "username": detail,
                }
            ), 200,)
    # If the login not good, return 401 Unauthorized.
    return jsonify({"error": detail}), 401


# Read user information.
# Returns 200 OK on success, or 400 Bad Request on failure.
@app.get("/api/read-user-info")
def read_user_info():
    username = request.args.get("username")
    # If the username is not provided, then return 400 Bad Request.
    if not username:
        return jsonify({"error": "username query parameter is required"}), 400
    
    conn = get_db_connection()
    
    try:
        user = db.db_read_user_info(conn, username)
    finally:
        conn.close()
    
    # If the user is not found, return a 404 error.
    if not user:
        return jsonify({"error": "User not found"}), 404
    # If the user is found, return the user information.
    return jsonify(dict(user))


# Update user information.
# Returns 200 OK on success, or 400 Bad Request on failure.
@app.get("/api/update-user-info")
def update_user_info():
    username = request.args.get("username")
    email = request.args.get("email")
    password = request.args.get("password")
    # If the username is not provided, then return 400 Bad Request.
    # Also if neither email or password is provided, then return 400 Bad Request.
    if (not username and not email) or (not username and not password):
        return jsonify({"error": "username and either email or password query parameters are required"}), 400
    
    conn = get_db_connection()
    # Try to update the user information.
    try:
        success = db.db_update_user_info(conn, username, email, password)
        if not success:
            # If the user information is not updated, return 400 Bad Request.
            return jsonify({"error": "User information not updated"}), 400
    finally:
        conn.close()
    
    # If the user information is updated, return 200 OK.
    return jsonify({"message": "User information updated successfully"}), 200


# Delete user account.
# Returns 200 OK on success, or 400 Bad Request on failure.
@app.get("/api/delete-user-account")
def delete_user_account():
    username = request.args.get("username")
    password = request.args.get("password")
    confirmation = request.args.get("confirmation")

    # If any of the inputs are empty, then return 400 Bad Request.
    if not username or not password or not confirmation:
        return jsonify({"error": "username, password, and confirmation query parameters are required"}), 400
    
    conn = get_db_connection()
    try:
        success = db.db_delete_user_account(conn, username, password, confirmation)
        if not success:
            # If the user account is not deleted, return 400 Bad Request.
            return jsonify({"error": "User account not deleted"}), 400
    finally:
        conn.close()
    
    # If the user account is deleted, return 200 OK.
    return jsonify({"message": "User account deleted successfully"}), 200


# Add a new device.
# Returns 200 OK on success, or 400 Bad Request on failure.
@app.get("/api/add-device")
def add_device():
    username = request.args.get("username")
    device_name = request.args.get("device_name")
    device_os = request.args.get("device_os")
    device_components = request.args.get("device_components")
    # If any of the inputs are empty, then return 400 Bad Request.
    if not username or not device_name or not device_os or not device_components:
        return jsonify({"error": "username, device_name, device_os, and device_components query parameters are required"}), 400

    # Convert json string to a list of lists because thats how I designed the function in the db_functions.py file.
    try:
        device_components = json.loads(device_components)
    except json.JSONDecodeError:
        return jsonify({"error": "device_components must be valid JSON"}), 400
    
    conn = get_db_connection()
    try:
        success = db.db_add_device(conn, username, device_name, device_os, device_components)
        if not success:
            # If the device is not added, return 400 Bad Request.
            return jsonify({"error": "Device not added"}), 400
    finally:
        conn.close()
    
    # If the device is added, return 200 OK.
    return jsonify({"message": "Device added successfully"}), 200


# Read device information.
# Returns 200 OK on success, or 400 Bad Request on failure.
@app.get("/api/read-device-info")
def read_device_info():
    username = request.args.get("username")
    # If the username is not provided, then return 400 Bad Request.
    if not username:
        return jsonify({"error": "username query parameter is required"}), 400
    
    conn = get_db_connection()
    try:
        devices = db.db_read_device_info(conn, username)
    finally:
        conn.close()
    
    # If the devices are not found, return 404 Not Found.
    if not devices:
        return jsonify({"error": "Devices not found"}), 404
    # Rows are joins (Device_Name, OS_Type, Category, Model_Name, Max_Value); return as JSON list.
    return jsonify([dict(row) for row in devices])


# Update device information.
# Returns 200 OK on success, or 400 Bad Request on failure.
@app.get("/api/update-device-info")
def update_device_info():
    username = request.args.get("username")
    device_name = request.args.get("device_name")
    new_device_name = request.args.get("new_device_name")
    new_device_os = request.args.get("new_device_os")
    raw_components = request.args.get("new_device_components")

    # If the username or device_name is not provided, then return 400 Bad Request.
    if not username or not device_name:
        return jsonify({"error": "username and device_name query parameters are required"}), 400

    # Optional JSON array of component rows.
    parsed_components = None
    # If the raw_components is provided, then parse it into a list of lists.
    if raw_components and str(raw_components).strip():
        try:
            parsed_components = json.loads(raw_components)
        # If the raw_components is not valid JSON, then return 400 Bad Request.
        except json.JSONDecodeError:
            return jsonify({"error": "new_device_components must be valid JSON"}), 400

    # Require something to actually update (DB applies each field only if provided).
    nonempty_list = isinstance(parsed_components, list) and len(parsed_components) > 0
    has_update = (new_device_name or "").strip() or (new_device_os or "").strip() or nonempty_list

    # If there is no update, then return 400 Bad Request.
    if not has_update:
        err = (
            "at least one of new_device_name, new_device_os, "
            "or a non-empty new_device_components array is required"
        )
        return jsonify({"error": err}), 400

    conn = get_db_connection()
    try:
        # This is where we actually update the device information.
        ok = db.db_update_device_info(
            conn, username, device_name, new_device_name, new_device_os, parsed_components
        )
        # If the device information is not updated, return 400 Bad Request.
        if not ok:
            return jsonify({"error": "Device information not updated"}), 400
    finally:
        conn.close()

    return jsonify({"message": "Device information updated successfully"}), 200


# Delete a device.
# Returns 200 OK on success, or 400 Bad Request on failure.
@app.get("/api/delete-device")
def delete_device():
    username = request.args.get("username")
    device_name = request.args.get("device_name")
    confirmation = request.args.get("confirmation")
    # If any of the inputs are empty, then return 400 Bad Request.
    if not username or not device_name or not confirmation:
        return jsonify({"error": "username, device_name, and confirmation query parameters are required"}), 400
    
    conn = get_db_connection()
    try:
        success = db.db_delete_device(conn, username, device_name, confirmation)
        if not success:
            # If the device is not deleted, return 400 Bad Request.
            return jsonify({"error": "Device not deleted"}), 400
    finally:
        conn.close()
    
    # If the device is deleted, return 200 OK.
    return jsonify({"message": "Device deleted successfully"}), 200


if __name__ == "__main__":
    app.run(port=5000, debug=True)
