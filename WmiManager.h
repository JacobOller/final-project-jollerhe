#ifndef WMIMANAGER_H
#define WMIMANAGER_H

#include <windows.h>
#include <Wbemidl.h>
#include <wrl/client.h> // For ComPtr smart pointer.
#include <string>


class WmiManager {
private:
    int cores = 0; // Number of CPU cores.
    std::string cpu_name; // CPU model name.
    unsigned int cpu_max_clock_speed = 0; // CPU max clock speed.
    std::string cpu_description; // CPU description.
    std::string architecture; // CPU architecture (x86, x64, etc...).

    float gpu_max_memory = 0.0;
    std::string gpu_description;

    float ram_max_memory = 0.0;
    unsigned int ram_max_speed = 0;
    std::string ram_description;

    // Smart pointer to the WMI service, used for querying WMI.
    Microsoft::WRL::ComPtr<IWbemServices> pSvc; 

    HRESULT initialize_com();
    HRESULT connect_wmi();
 
public:
    HRESULT initialize();

    int get_physical_cpu_cores();
    std::string get_cpu_name();
    unsigned int get_cpu_max_clock_speed();
    std::string get_cpu_description();
    std::string get_architecture();

    float get_gpu_max_memory();
    std::string get_gpu_description();

    float get_ram_max_memory();
    unsigned int get_ram_max_speed();
    std::string get_ram_description();
    

    std::string convert_architecture_to_string(int arch);

    enum class DataType {
        CPU_CORES,
        CPU_NAME,
        CPU_MAX_CLOCK_SPEED,
        CPU_DESCRIPTION,
        CPU_ARCHITECTURE,
        GPU_MAX_MEMORY,
        GPU_DESCRIPTION,
        RAM_MAX_MEMORY,
        RAM_MAX_SPEED,
        RAM_DESCRIPTION
    };

    /**
     * General function for retrieving static data from WMI.
     * Can currently retrieve CPU physical cores, CPU name, and CPU max clock speed.
    */ 
    HRESULT retrieve_static_data(DataType type);
};

#endif // WMIMANAGER_H