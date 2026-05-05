import sqlite3
import pandas as pd
import pwinput
from datetime import datetime

# functions to take in paramaters instead of input.
# This way, once we implement the GUI, we can just pass the paramaters to the functions.
# This will also make the code more modular and easier to maintain.
# Also, add error handling to all functions.
# This way, if the user enters an invalid input, the program will not crash.
# Also, add validation to all inputs.
# This way, the program will not accept invalid inputs.
# Also, add logging to all functions.
# This way, we can log all the actions of the user.
# Also, add a way to exit the program.
# This way, the user can exit the program by pressing a button.


# Function to allow user create a new account.
def create_account(conn, email, username, password):
    curr = conn.cursor()
    while True:
        # Check if the email already exists in the database
        curr.execute(
            '''
            SELECT * FROM User
            WHERE Email = ?
            ''', (email,)
        )
        db_email = curr.fetchone()
        if db_email:
            print("Email already exists. Please login or use a different email to create an account.")
            return
        
        # Check if the username already exists in the database
        curr.execute(
            '''
            SELECT * FROM User
            WHERE Username = ?
            ''', (username,)
        )
        db_username = curr.fetchone()
        if db_username:
            print("Username already exists. Please choose a different username.")
            continue
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        # If the username is unique and passwords match, create the account
        curr.execute(
            '''
            INSERT INTO User (Username, Password, Email, Created_Date)
            VALUES (?, ?, ?, ?)
            ''', (username, password, email, timestamp)
        )
        conn.commit()
        print(f"Account created successfully! Welcome {username}.")
        return username
    

# Function to allow user to login to account.
def login(conn, username, password):
    curr = conn.cursor()

    while True:
        # Check if the username exists in the database
        curr.execute(
            '''
            SELECT * FROM User
            WHERE Username = ?
            ''', (username,)
        )
        db_username = curr.fetchone()
        if not db_username:
            print("User not found.")
            continue
        
        # Check if the password matches for that username
        curr.execute(
            '''
            SELECT * FROM User
            WHERE Username = ? AND Password = ?
            ''', (username, password)
        )
        db_user = curr.fetchone()
        if not db_user:
            print("Incorrect password.")
            continue
        
        # If the username and password match, print welcome message
        print(f"Login successful! Welcome back {username}.")
        return username
    

# Function to read user info, including username, email, and bio.
def read_user_info(conn, username):
    curr = conn.cursor()
    curr.execute('SELECT * FROM User WHERE Username = ?', (username,))
    user = curr.fetchone()

    if user:
        print("\nUser Information:")
        print(f"Username: {user[1]}")
        print(f"Email: {user[3]}")
        print(f"Account Created: {user[4]}")
    else:
        print("User not found.")


# Function to update user info, including email and password.
def update_user_info(conn, username, email = None, password = None):
    curr = conn.cursor()

    if email:
        # Check if the new email already exists in the database
        curr.execute(
            '''
            SELECT * FROM User
            WHERE Email = ?
            ''', (email,)
        )
        db_email = curr.fetchone()
        if db_email:
            print("Email already exists. Please use a different email.")
            return

        # If the email doesn't exist, update the email of the user.
        curr.execute(
            '''
            UPDATE User
            SET Email = ?
            WHERE Username = ?
            ''', (email, username)
        )
        conn.commit()
        print("Email updated successfully!")
        return
    
    if password:
        # Check if the new password already exists in the database
        curr.execute(
            '''
            SELECT * FROM User
            WHERE Password = ?
            ''', (password,)
        )
        db_password = curr.fetchone()
        if db_password:
            print("Password already exists. Please use a different password.")
            return
        
        # If the password doesn't exist, update the password of the user.
        curr.execute(
            '''
            UPDATE User
            SET Password = ?
            WHERE Username = ?
            ''', (password, username)
        )
        conn.commit()
        print("Password updated successfully!")
        return

    print("No information to update.")
    return


# Function to delete user account.
def delete_user_account(conn, username, password, confirmation = None):
    curr = conn.cursor()
    if confirmation:
        curr.execute(
            '''
            DELETE FROM User
            WHERE Username = ? AND Password = ?
            ''', (username, password)
        )
        conn.commit()
        print("Account deleted successfully.")
        return
    
    print("Account deletion cancelled.")
    return


# Function to add a device, including device name, OS, and the components for that device.
# Note: My CS2300 project has the ability to find this information for the user, but for this project, I will just have the user input this information manually.
def add_device(conn, username, device_name, device_os, device_components):
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

    # For the components, user will have to enter multiple components.
    # device_components = []
    # print("Enter the device components.")
    # print("The components should be limited to CPU, GPU, RAM.")
    # while True:
    #     component_name = input("Enter component name (or type 'done' to finish): ")
    #     if component_name.lower() == 'done':
    #         break

    #     component_category = input("Enter component category (CPU, GPU, RAM): ")
    #     component_max_value = input("Enter component max value (for CPU, clockspeed, for GPU, VRAM, for RAM, capacity): ")
    #     device_components.append([component_name, component_category, component_max_value])
    
    # Find Device_ID for the device we just added, since this is a FK for Component table.
    curr.execute('SELECT Device_ID FROM Device WHERE Device_Name = ? AND User_ID = ?', (device_name, user_id))
    device_id = curr.fetchone()[0]

    # Loop through the components, adding the device_id as a FK for each component.
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
    print("Device added successfully.")


# Function to read device info, including device name, OS, and the components for that device.
def read_device_info(conn, username):
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
            print("\nDevice Information:")
            for device in devices:
                print(f"Device Name: {device[0]}")
                print(f"Device OS: {device[1]}")
                print(f"Component Category: {device[2]}")
                print(f"Component Model Name: {device[3]}")
                print(f"Component Max Value: {device[4]}")
                print("\n")
        else:
            print("No devices found for this user.")


# Helper function to update the components for a device.
def update_device_components(conn, username, device_name, new_device_component):
    curr = conn.cursor()

    # Get the device_id for the device we are updating the components for.
    curr.execute('SELECT Device_ID FROM Device WHERE Device_Name = ? AND User_ID = ?', (device_name, username))
    device_id = curr.fetchone()[0]

    # Loop through the components, updating the device_id as a FK for each component.
    for component in new_device_component:
        component_name = component[0]
        component_category = component[1]
        component_max_value = component[2]

        # Update the component with the new component name, category, and max value.
        curr.execute(
            '''
            UPDATE Component
            SET Model_Name = ?, Category = ?, Max_Value = ?
            WHERE Device_ID = ? AND Model_Name = ?
            ''', (component_name, component_category, component_max_value, device_id)
        )
    
    conn.commit()
    print("Device components updated successfully.")
    return

# Function to update device info, including device name, OS, and the components for that device.
def update_device_info(conn, username, device_name, new_device_name = None, new_device_os = None, new_device_component = None):
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
        print("Device not found.")
        return
    
    if new_device_name:
        # Change the name of the device to the new device name.
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
    if new_device_os:
        # Change the operating system of the device to the new operating system.
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

    conn.commit()
    print("Device information updated successfully.")

    if new_device_component:
        update_device_components(conn, username, device_name, new_device_component)
    return

# Function to delete a device.

def delete_device(conn, username, device_name, confirmation):
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
    if not db_device:
        print("Device not found.")
        return
    
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
            ''', (db_device[0],)
        )

        conn.commit()
        print("Device deleted successfully.")
    else:
        print("Device deletion cancelled.")


if __name__ == "__main__":
    conn = sqlite3.connect('hardware_perf.db')
    curr = conn.cursor()

    # Delete jollerhe from database, along with the user's devices.
    # target_username = "jollerhe"
    # curr.execute(
    #     '''
    #     DELETE FROM Component
    #     WHERE Device_ID IN (
    #         SELECT Device_ID
    #         FROM Device
    #         WHERE User_ID = (
    #             SELECT User_ID
    #             FROM User
    #             WHERE Username = ?
    #         )
    #     )
    #     ''',
    #     (target_username,)
    # )
    # curr.execute(
    #     '''
    #     DELETE FROM Device
    #     WHERE User_ID = (
    #         SELECT User_ID
    #         FROM User
    #         WHERE Username = ?
    #     )
    #     ''',
    #     (target_username,)
    # )
    # curr.execute(
    #     '''
    #     DELETE FROM User
    #     WHERE Username = ?
    #     ''',
    #     (target_username,)
    # )

    print("Original database:")
    curr.execute('SELECT * FROM User')
    user_table = curr.fetchall()
    curr.execute('SELECT * FROM Device')
    device_table = curr.fetchall()
    curr.execute('SELECT * FROM Component')
    component_table = curr.fetchall()
    df_user = pd.DataFrame(user_table, columns=['User_ID', 'Username', 'Email', 'Password', 'Created_Date'])
    df_device = pd.DataFrame(device_table, columns=['Device_ID', 'Device_Name', 'OS_Type', 'Last_Used', 'User_ID'])
    df_component = pd.DataFrame(component_table, columns=['Component_ID', 'Category', 'Model_Name', 'Max_Value', 'Device_ID'])
    print(df_user)
    print(df_device)
    print(df_component)

    username = login(conn)
    if username:
        while True:
            print("1. Read User Info")
            print("2. Update User Info")
            print("3. Delete User Account")
            print("4. Add Device")
            print("5. Read Device Info")
            print("6. Update Device Info")
            print("7. Delete Device")
            print("8. Exit")

            choice = input("Enter your choice: ")
            if choice == '1':
                read_user_info(conn, username)
            elif choice == '2':
                update_user_info(conn, username)
            elif choice == '3':
                delete_user_account(conn, username)
            elif choice == '4':
                add_device(conn, username)
            elif choice == '5':
                read_device_info(conn, username)
            elif choice == '6':
                update_device_info(conn, username)
            elif choice == '7':
                delete_device(conn, username)
            elif choice == '8':
                break
            else:
                print("Invalid choice. Please enter a valid choice.")
    else:
        print("Account creation failed. Please try again.")

    print("Final database:")
    curr.execute('SELECT * FROM User')
    user_table = curr.fetchall()
    curr.execute('SELECT * FROM Device')
    device_table = curr.fetchall()
    curr.execute('SELECT * FROM Component')
    component_table = curr.fetchall()
    df_user = pd.DataFrame(user_table, columns=['User_ID', 'Username', 'Email', 'Password', 'Created_Date'])
    df_device = pd.DataFrame(device_table, columns=['Device_ID', 'Device_Name', 'OS_Type', 'Last_Used', 'User_ID'])
    df_component = pd.DataFrame(component_table, columns=['Component_ID', 'Category', 'Model_Name', 'Max_Value', 'Device_ID'])
    print(df_user)
    print(df_device)
    print(df_component)

    conn.close()
    



