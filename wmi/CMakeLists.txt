cmake_minimum_required(VERSION 3.20)
project(final_project_jollerhe1)

set(CMAKE_CXX_STANDARD 20)

add_executable(final_project_jollerhe1 main.cpp
        WmiManager.cpp)

target_link_libraries(final_project_jollerhe1 PRIVATE
        wbemuuid
        ole32
        oleaut32)
