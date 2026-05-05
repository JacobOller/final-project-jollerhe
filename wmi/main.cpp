#include "WmiManager.h"
#include "hardware_json.h"
#include <iostream>
#include <string>
using std::cout, std::endl;


int main() {
    HRESULT hr;
    WmiManager wm;
    wm.initialize();

    hr = wm.retrieve_static_data(WmiManager::DataType::CPU_CORES);
    hr = wm.retrieve_static_data(WmiManager::DataType::CPU_NAME);
    hr = wm.retrieve_static_data(WmiManager::DataType::CPU_MAX_CLOCK_SPEED);
    hr = wm.retrieve_static_data(WmiManager::DataType::CPU_DESCRIPTION);
    hr = wm.retrieve_static_data(WmiManager::DataType::CPU_ARCHITECTURE);
    hr = wm.retrieve_static_data(WmiManager::DataType::GPU_DESCRIPTION);
    hr = wm.retrieve_static_data(WmiManager::DataType::RAM_MAX_SPEED);
    hr = wm.retrieve_static_data(WmiManager::DataType::RAM_DESCRIPTION);
    hr = wm.retrieve_static_data(WmiManager::DataType::DEVICE_NAME);
    hr = wm.retrieve_static_data(WmiManager::DataType::OS_CAPTION);
    hr = wm.retrieve_static_data(WmiManager::DataType::GPU_NAME);
    wm.update_live_usage_metrics();

    // JSON format of the device info; not yet implemented automatic transfer into database,
    // so the user must copy and paste this info into the ui when creating an account.
    cout << "JSON FORMAT OF DEVICE INFO: COPY AND PASTE" << endl << endl;
    cout << wmi_snapshot_to_json(wm) << endl << endl;

    cout << "---------- RESULTS ----------" << endl;
    cout << "This CPU has " << wm.get_physical_cpu_cores() << " physical cores." << endl;
    cout << "This CPU has the name: " << wm.get_cpu_name() << endl;
    cout << "This CPU has a max clock speed of: " << wm.get_cpu_max_clock_speed() << " MHz" << endl;
    cout << "This CPU has the description: " << wm.get_cpu_description() << endl;
    cout << "This CPU has the architecture: " << wm.get_architecture() << endl;
    cout << "This GPU has the name: " << wm.get_gpu_name() << endl;
    cout << "This GPU has the description: " << wm.get_gpu_description() << endl;
    cout << "This RAM has the max speed of: " << wm.get_ram_max_speed() << " MT/s" << endl;
    cout << "This RAM has the description: " << wm.get_ram_description() << endl;
    cout << "This device has the name: " << wm.get_device_name() << endl;
    cout << "This OS: " << wm.get_os_caption() << endl;
    cout << endl;
    cout << "Approximate CPU usage: " << wm.get_cpu_usage_percent() << " %" << endl;
    cout << "Approximate RAM usage: " << wm.get_ram_usage_percent() << " %" << endl;
    cout << "-----------------------------" << endl;

    return 0;
}
