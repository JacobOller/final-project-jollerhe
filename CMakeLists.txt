cmake_minimum_required(VERSION 3.20)
project(final_project_jollerhe1)

# Lets clangd use the same flags/includes from MSVC (see .clangd / .vscode).
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

set(CMAKE_CXX_STANDARD 20)

add_executable(final_project_jollerhe1
        wmi/main.cpp
        wmi/WmiManager.cpp
        wmi/hardware_json.cpp)

target_link_libraries(final_project_jollerhe1 PRIVATE
        wbemuuid
        ole32
        oleaut32)
