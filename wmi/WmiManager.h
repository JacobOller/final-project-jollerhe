#ifndef WMIMANAGER_H
#define WMIMANAGER_H

#include <windows.h>
#include <Wbemidl.h>
#include <wrl/client.h> // For ComPtr smart pointer.
#include <string>


class WmiManager {
private:
    // ----- STATIC VARIABLES -----
    // CPU
    int cores = 0; // Number of CPU cores.
    std::string cpu_name; // CPU model name.
    unsigned int cpu_max_clock_speed = 0; // CPU max clock speed.
    std::string cpu_description; // CPU description.
    std::string architecture; // CPU architecture (x86, x64, etc...).
    // GPU
    unsigned int gpu_max_memory = 0.0;
    std::string gpu_name;
    std::string gpu_description;
    // RAM
    unsigned long long ram_max_memory = 0.0;
    unsigned int ram_max_speed = 0;
    std::string ram_description;

    // DEVICE
    std::string device_name;
    std::string os_caption;

    // DYNAMIC VARIABLES
    // CPU
    double cpu_temp = 0.0;
    // Approximate CPU usage percentage.
    float cpu_usage_percent = 0.f;
    // Approximate RAM usage percentage.
    float ram_usage_percent = 0.f;



    // Smart pointer to the WMI service, used for querying WMI.
    Microsoft::WRL::ComPtr<IWbemServices> pSvc; 

    HRESULT initialize_com();
    HRESULT connect_wmi();

    /** WMI perf / OS memory queries — separate from Win32_* static hardware enumeration. */
    HRESULT query_cpu_usage_percent_wmi();
    HRESULT query_ram_usage_percent_wmi();

public:
    HRESULT initialize();

    int get_physical_cpu_cores() const;
    std::string get_cpu_name() const;
    unsigned int get_cpu_max_clock_speed() const;
    std::string get_cpu_description() const;
    std::string get_architecture() const;

    unsigned int get_gpu_max_memory() const;
    std::string get_gpu_name() const;
    std::string get_gpu_description() const;

    unsigned long long get_ram_max_memory() const;
    unsigned int get_ram_max_speed() const;
    std::string get_ram_description() const;

    std::string get_device_name() const;
    std::string get_os_caption() const;

    float get_cpu_usage_percent() const;
    float get_ram_usage_percent() const;

    /** Updates cpu_usage_percent and ram_usage_percent (call after initialize()). For graphs, poll this on a timer. */
    HRESULT update_live_usage_metrics();

    std::string convert_architecture_to_string(int arch) const;

    enum class DataType {
        CPU_CORES,
        CPU_NAME,
        CPU_MAX_CLOCK_SPEED,
        CPU_DESCRIPTION,
        CPU_ARCHITECTURE,
        GPU_MAX_MEMORY,
        GPU_NAME,
        GPU_DESCRIPTION,
        RAM_MAX_MEMORY,
        RAM_MAX_SPEED,
        RAM_DESCRIPTION,
        CPU_TEMPERATURE,
        DEVICE_NAME,
        OS_CAPTION
    };

    /**
     * General function for retrieving static data from WMI.
     * Can currently retrieve CPU physical cores, CPU name, and CPU max clock speed.
    */ 
    HRESULT retrieve_static_data(DataType type);
};

#endif // WMIMANAGER_H