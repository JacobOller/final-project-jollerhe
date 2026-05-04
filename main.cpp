#include "WmiManager.h"
#include <iostream>
using std::cout, std::endl;


int main() {
    WmiManager wm;
    if (SUCCEEDED(wm.initialize())) {
        cout << "Ready to query data!" << endl;
    }

    HRESULT hr;
    cout << "------------------------------" << endl;
    cout << "Querying WMI for CPU cores..." << endl;
    hr = wm.retrieve_static_data(WmiManager::DataType::CPU_CORES);
    cout << "------------------------------" << endl;
    cout << "Querying WMI for CPU name..." << endl;
    hr = wm.retrieve_static_data(WmiManager::DataType::CPU_NAME);
    cout << "------------------------------" << endl;
    cout << "Querying WMI for CPU max clock speed..." << endl;
    hr = wm.retrieve_static_data(WmiManager::DataType::CPU_MAX_CLOCK_SPEED);
    cout << "------------------------------" << endl;
    cout << "Querying WMI for CPU description..." << endl;
    hr = wm.retrieve_static_data(WmiManager::DataType::CPU_DESCRIPTION);
    cout << "------------------------------" << endl;
    cout << "Querying WMI for CPU architecture..." << endl;
    hr = wm.retrieve_static_data(WmiManager::DataType::CPU_ARCHITECTURE);
    cout << "------------------------------" << endl;
    cout << "Querying WMI for GPU max memory size..." << endl;
    hr = wm.retrieve_static_data(WmiManager::DataType::GPU_MAX_MEMORY);
    cout << "-----------------------------" << endl;
    cout << "Querying WMI for GPU Description..." << endl;
    hr = wm.retrieve_static_data(WmiManager::DataType::GPU_DESCRIPTION);
    cout << "------------------------------" << endl;
    cout << "Querying WMI for RAM max memory size..." << endl;
    hr = wm.retrieve_static_data(WmiManager::DataType::RAM_MAX_MEMORY);
    cout << "-----------------------------" << endl;
    cout << "Querying WMI for RAM max speed..." << endl;
    wm.retrieve_static_data(WmiManager::DataType::RAM_MAX_SPEED);
    cout << "-----------------------------" << endl;
    cout << "Querying WMI for RAM description..." << endl;
    wm.retrieve_static_data(WmiManager::DataType::RAM_DESCRIPTION);
    cout << "-----------------------------" << endl;


    cout << "---------- RESULTS ----------" << endl;
    cout << "This CPU has " << wm.get_physical_cpu_cores() << " physical cores." << endl;
    cout << "This CPU has the name: " << wm.get_cpu_name() << endl;
    cout << "This CPU has a max clock speed of: " << wm.get_cpu_max_clock_speed() << " MHz" << endl;
    cout << "This CPU has the description: " << wm.get_cpu_description() << endl;
    cout << "This CPU has the architecture: " << wm.get_architecture() << endl;
    cout << "This GPU has a max memory size of: " << wm.get_gpu_max_memory() << " GB" << endl;
    cout << "This GPU has the description: " << wm.get_gpu_description() << endl;
    cout << "This RAM has the max memory size of: " << wm.get_ram_max_memory() << " GB" << endl;
    cout << "This RAM has the max speed of: " << wm.get_ram_max_speed() << " MT/s" << endl;
    cout << "This RAM has the description: " << wm.get_ram_description() << endl;
    cout << "-----------------------------" << endl;


    return 0;
}
