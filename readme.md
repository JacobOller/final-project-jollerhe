# Hardware Performance Monitor (Unfinished)

My program is a small Windows hardware performance monitor that has a Flask-React frontend. The C++ WMI client (WmiManager and hardware_json) queries the machine for information in the CPU, GPU and RAM, aswell as things like the device name and OS. 
The program is able to track live CPU/RAM percentages in C++ and include them in the WMI JSON, although I was not able to chart them in the UI yet. On signup, the user can paste that JSON so the backend validates it and saves one Device plus CPU/GPU/RAM Component rows (login does not repeat that step).
The React frontend communicates with the Flask API backend with sqlite3 in python (data/hardware_perf.db) for signup, login, and device/user CRUD.

## What I finished
- Static data retrieval (cpu+gpu name, OS, cpu cores, etc...) through WMI in C++.
- Full backend to frontend setup with flask and react to display user database information. This was mostly created in my CS2500 final project, although I add some functionality to allow the C++ program to find the user's device info and allow the user to just copy and paste this info (JSON) during account creation.
- Dynamic data retrieval (cpu usage, ram usage): this was supposed to be the main objective of the project, with the end goal being to display this data with graphs in my frontend ui. Although I completed the rest of the ui and successfully retrieved this dynamic data in WmiManager, I was never able to implement it into the UI.

CS2300 Main Project Files:
- All the files in wmi directory
- backend\insert_static_data.py
- Slight additions to backend\api.py (like 2 additions)
- Slight additions to RegisterPage.jsx (frontend)
- Slight additions to AuthProvider.jsx (frontend)


## References:

- [WMI Documentation] (https://learn.microsoft.com/en-us/windows/win32/wmisdk/creating-a-wmi-application-using-c-)
Used for COM initialization, including security setup. Contains links to everything WMI related, such as ExecQuery, IWbemClassObject, VARIANT type, as well as many examples of querying for different data, initializing the COM, and all of the other setup required for querying for windows hardware data. Used in WmiManager.cpp.

- [Hardware Class Names (CIM Classes)] (https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/computer-system-hardware-classes)
All of the class names of hardware components.

- [Windows Hardware Classes] (https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/computer-system-hardware-classes)
Inherit from CIM Classes; Specific to win32 machines, for example Win32_Processor.


## AI Usage (From CS2500 Project)
AI helped tremendously with the frontend, as React was something that I have never worked with before, as well as syncing the backend with Flask, although I picked up Flask a lot easier than I did for React. 
I used AI tools (Gemini Pro and Microsoft Copilot) in several ways: 
- generating sample data and SQL INSERT statements (insert.statements.sql).
- getting an initial example of calling backend Python from the browser via a Flask endpoint, starting with db_read_user_info / menu option 1, then implementing the remaining menu options myself. 
- Because I was completely new to React, AI helped massively with frontend structure, styling (App.css, index.css), shared API helpers (client.js), and authentication (mainly for maintaining user info throughout session) in AuthProvider.jsx.
- Gemini Pro in particular helped with the first version App.jsx, as this is where I learned about React functionality and how to interact with the window. Eventually, I decided to switch my layout to an individual per db_function, which I have in frontend/src/pages.
- it also helped plan the layout and parts of Layout.jsx and App.jsx. 
- I noted down my general use of AI in each frontend file at the top with a comment.
- Flask was mostly straightforward for me compared to React, AI mainly supported syncing the frontend to the backend.
- Note: I besides learning Flask and a few instances here and there in api.py, I didn't use AI at all for the backend.
- Gemini Pro also helped to plan out the general layout of the frontend aswell as specific parts of files like Layout.jsx and of course App.jsx. 

## AI Usage (From this Project):
I didn't utilize AI much at all for this project. The main way in which I utilized AI were:
- Configuring MSVC compiler info, as I ran into so many issues with even getting my project to build. This was partially due to switching IDE's midway through the project (bad idea).
- JSON formatter (hardware_json.cpp): This was honestly the perfect job for ai, as formatting data into JSON format is just a pain and doesn't really take much logic as opposed to tedious nested dictionaries and lists.