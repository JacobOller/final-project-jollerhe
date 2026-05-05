import db_functions as db


# Function to check if the C++ JSON data is in its correct format for database insertion.
def hardware_format_checker(data):
    # Data must be a dictionary (JSON is just a massive nested dictionary)
    if not isinstance(data, dict):
        return False
    # Device must be a dictionary, and components must be a list.
    device = data.get("device")
    components = data.get("components")
    if not isinstance(device, dict) or not isinstance(components, list):
        return False
    for key in device:
        if key not in ("device_name", "os_type"):
            return False
    for component in components:
        if not isinstance(component, dict):
            return False
        for key in component:
            if key not in ("category", "model_name", "max_value"):
                return False
    if len(components) == 0:
        return False
    return True


# Function to insert the static data into the database.
# Uses the db_add_device function from db_functions.py to insert the data into the database.
def insert_static_data(conn, data, username):
    # Checks if data is in valid JSON format.
    if not hardware_format_checker(data):
        return False

    d = data["device"]
    rows = []
    # Order must match db_add_device: component[0]=Model_Name, component[1]=Category, component[2]=Max_Value
    for c in data["components"]:
        rows.append([c["model_name"], c["category"], c["max_value"]])

    return db.db_add_device(conn, username, d["device_name"], d["os_type"], rows)
