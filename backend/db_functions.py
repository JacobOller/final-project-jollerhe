# Database functions for the backend of the application. These are used to directly interact with the database.
# The functions are called by the API endpoints in the api.py file. These endpoints are then called by the frontend.

from datetime import datetime


# Function to allow user create a new account.
# Returns (True, username) on success, or (False, error_message) on failure.
def db_create_account(conn, email, username, password):
    # Strip the email, username, and password to remove any whitespace.
    email = (email or "").strip()
    username = (username or "").strip()
    if password is None:
        password = ""
    else:
        password = password.strip()
    # If any of the inputs are empty, then return False and the error message.
    if not email or not username or not password:
        return (False, "email, username, and password are required")

    curr = conn.cursor()

    # Check if the email already exists in the database.
    curr.execute(
        '''
        SELECT 1 FROM User
        WHERE Email = ?
        ''',
        (email,),
    )
    if curr.fetchone():
        return (
            False,
            "Email already exists. Please login or use a different email to create an account.",
        )
    
    # Check if the username already exists in the database.
    curr.execute(
        '''
        SELECT 1 FROM User
        WHERE Username = ?
        ''',
        (username,),
    )
    if curr.fetchone():
        return (False, "Username already exists. Please choose a different username.")

    # Add the user to the database.
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    curr.execute(
        '''
        INSERT INTO User (Username, Password, Email, Created_Date)
        VALUES (?, ?, ?, ?)
        ''',
        (username, password, email, timestamp),
    )
    conn.commit()
    return (True, username)


# Function to allow user to login to account.
# Returns (True, username) on success, or (False, error_message) on failure.
def db_login(conn, username, password):
    username = (username or "").strip()
    if password is None:
        password = ""
    else:
        password = password.strip()
    # If any of the inputs are empty, then return False and the error message.
    if not username or not password:
        return (False, "username and password are required")

    curr = conn.cursor()

    # Check if the username exists in the database.
    curr.execute(
        '''
        SELECT * FROM User
        WHERE Username = ?
        ''',
        (username,),
    )
    if not curr.fetchone():
        return (False, "User not found.")

    # Check if the password is correct.
    curr.execute(
        '''
        SELECT * FROM User
        WHERE Username = ? AND Password = ?
        ''',
        (username, password),
    )
    if not curr.fetchone():
        return (False, "Incorrect password.")

    return (True, username)


# Function to read user info, including username, email, and bio.
# Returns the user info on success, or None on failure.
def db_read_user_info(conn, username):
    curr = conn.cursor()
    curr.execute('SELECT * FROM User WHERE Username = ?', (username,))
    user = curr.fetchone()

    if user:
        return user
    else:
        return None


# Function to update user info, including email and password.
# Returns True on success, or False on failure.
def db_update_user_info(conn, username, email = None, password = None):
    curr = conn.cursor()

    # If the email is provided, then update the email of the user.
    if email:
        # Reject if another user already has this email.
        curr.execute(
            '''
            SELECT * FROM User
            WHERE Email = ? AND Username != ?
            ''', (email, username)
        )
        db_email = curr.fetchone()
        if db_email:
            return False

        # If the email doesn't exist, update the email of the user.
        curr.execute(
            '''
            UPDATE User
            SET Email = ?
            WHERE Username = ?
            ''', (email, username)
        )
        conn.commit()
    
    # If the password is provided, then update the password of the user.
    if password:
        curr.execute(
            '''
            UPDATE User
            SET Password = ?
            WHERE Username = ?
            ''', (password, username)
        )
        conn.commit()

    return True


# Function to delete user account.
# Returns True on success, or False on failure.
def db_delete_user_account(conn, username, password, confirmation = None):
    curr = conn.cursor()

    # If the user confirms the deletion, then delete the user account.
    if confirmation:
        curr.execute(
            '''
            DELETE FROM User
            WHERE Username = ? AND Password = ?
            ''', (username, password)
        )
        conn.commit()
        return True
    
    # If the user does not confirm the deletion, then return False.
    return False


# Function to add a device, including device name, OS, and the components for that device.
# Note: My CS2300 project has the ability to find this information for the user through WMI,
# but for this project, I will just have the user input this information manually.
# Returns True on success, or False on failure.
def db_add_device(conn, username, device_name, device_os, device_components):
    curr = conn.cursor()

    # Find User_ID for the user, since this is a FK for Device table.
    curr.execute('SELECT User_ID FROM User WHERE Username = ?', (username,))
    user_id = curr.fetchone()[0]
    curr.execute(
        '''
        INSERT INTO Device (Device_Name, OS_Type, User_ID)
        VALUES (?, ?, ?)
        ''', (device_name, device_os, user_id)
    )
    
    # Find Device_ID for the device we just added, since this is a FK for Component table.
    curr.execute('SELECT Device_ID FROM Device WHERE Device_Name = ? AND User_ID = ?', (device_name, user_id))
    device_id = curr.fetchone()[0]

    # Loop through the components, since devices have multiple components.
    for component in device_components:
        component_name = component[0]
        component_category = component[1]
        component_max_value = component[2]
        curr.execute(
            '''
            INSERT INTO Component (Category, Model_Name, Max_Value, Device_ID)
            VALUES (?, ?, ?, ?)
            ''', (component_category, component_name, component_max_value, device_id)
        )
    
    conn.commit()
    return True


# Function to read device info, including device name, OS, and the components for that device.
# Returns the device info on success, or None on failure.
def db_read_device_info(conn, username):
        curr = conn.cursor()

        curr.execute(
            '''
            SELECT d.Device_Name, d.OS_Type, c.Category, c.Model_Name, c.Max_Value
            FROM Device d
            JOIN Component c ON d.Device_ID = c.Device_ID
            WHERE d.User_ID = (
                SELECT User_ID
                FROM User
                WHERE Username = ?
            )
            ''', (username,)
        )
        devices = curr.fetchall()
    
        if devices:
            return devices
        return None


# Helper function to update the components for a device.
# Returns True on success, or False on failure.
def db_update_device_components(conn, username, device_name, new_device_component):
    curr = conn.cursor()

    # Find User_ID for the user, since this is a FK for Device table.
    curr.execute('SELECT User_ID FROM User WHERE Username = ?', (username,))
    user_id = curr.fetchone()[0]
    # Get the device_id for the device we are updating the components for.
    curr.execute('SELECT Device_ID FROM Device WHERE Device_Name = ? AND User_ID = ?', (device_name, user_id))
    device_id = curr.fetchone()[0]

    # Loop through the components, since devices have multiple components.
    for component in new_device_component:
        component_name = component[0]
        component_category = component[1]
        component_max_value = component[2]


        curr.execute(
            '''
            UPDATE Component
            SET Model_Name = ?, Category = ?, Max_Value = ?
            WHERE Device_ID = ? AND Category = ?
            ''', (
                component_name,
                component_category,
                component_max_value,
                device_id,
                component_category,
            ),
        )

    return True

# Function to update device info, including device name, OS, and the components for that device.
# Returns True on success, or False on failure.
def db_update_device_info(conn, username, device_name, new_device_name = None, new_device_os = None, new_device_component = None):
    curr = conn.cursor()

    # Check if the device exists for that user
    curr.execute(
        '''
        SELECT * FROM Device
        WHERE User_ID = (
            SELECT User_ID
            FROM User
            WHERE Username = ?
        ) AND Device_Name = ?
        ''', (username, device_name)
    )
    db_device = curr.fetchone()
    if not db_device:
        return False

    # Use original device_name until all updates succeed because if you rename early it will probably break.
    if new_device_component:
        db_update_device_components(conn, username, device_name, new_device_component)

    # If the User wants to update the OS.
    if new_device_os:
        curr.execute(
            '''
            UPDATE Device
            SET OS_Type = ?
            WHERE User_ID = (
                SELECT User_ID
                FROM User
                WHERE Username = ?
            ) AND Device_Name = ?
            ''', (new_device_os, username, device_name)
        )
    # If the User wants to update the name.
    if new_device_name:
        curr.execute(
            '''
            UPDATE Device
            SET Device_Name = ?
            WHERE User_ID = (
                SELECT User_ID
                FROM User
                WHERE Username = ?
            ) AND Device_Name = ?
            ''', (new_device_name, username, device_name)
        )

    conn.commit()
    return True


# Function to delete a device.
# Returns True on success, or False on failure.
def db_delete_device(conn, username, device_name, confirmation):
    curr = conn.cursor()

    # Check if the device exists for that user
    curr.execute('''
        SELECT * FROM Device
        WHERE User_ID = (
            SELECT User_ID
            FROM User
            WHERE Username = ?
        ) AND Device_Name = ?
        ''', (username, device_name)
    )
    db_device = curr.fetchone()
    device_id = db_device[0]
    # If the device does not exist, return False.
    if not db_device:
        return False
    
    # If the user confirms the deletion, then delete the device and the components.
    if confirmation:
        curr.execute(
            '''
            DELETE FROM Device
            WHERE User_ID = (
                SELECT User_ID
                FROM User
                WHERE Username = ?
            ) AND Device_Name = ?
            ''', (username, device_name)
        )
        curr.execute(
            '''
            DELETE FROM Component
            WHERE Device_ID = ?
            ''', (device_id,)
        )

        conn.commit()
        return True
    
    # If the user does not confirm the deletion, return False.
    return False
