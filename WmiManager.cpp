#include "WmiManager.h"
#include <comdef.h>


#include <iostream>
using std::cout, std::endl, Microsoft::WRL::ComPtr;


HRESULT WmiManager::initialize_com() {
    // Initialize COM library.
    // HRESULT is Windows data type used to signify success or failure.
    HRESULT hr = CoInitializeEx(0, COINIT_MULTITHREADED);
    if (FAILED(hr)) {
        cout << "Failed to initialize COM library. Error code = 0x" 
             << std::hex << hr << endl;
        return hr; // Program has failed.
    }
    
    // Set general COM security levels.
    hr = CoInitializeSecurity(
        NULL,                        // Security descriptor    
        -1,                          // COM negotiates authentication service
        NULL,                        // Authentication services
        NULL,                        // Reserved
        RPC_C_AUTHN_LEVEL_DEFAULT,   // Default authentication level for proxies
        RPC_C_IMP_LEVEL_IMPERSONATE, // Default Impersonation level for proxies
        NULL,                        // Authentication info
        EOAC_NONE,                   // Additional capabilities of the client or server
        NULL);                       // Reserved

    if (FAILED(hr)) {
        cout << "Failed to initialize security. Error code = 0x" 
                << std::hex << hr << endl;
        CoUninitialize();
        return hr;  // Program failed.
    }
    return S_OK; // Program successfully initialized COM.
}

HRESULT WmiManager::connect_wmi() {
    // Initialize IWbemLocator to connect to WMI namespace.
    // ComPtr is COM's version of a smart pointer, automatically releases object when it goes out of scope.
    ComPtr<IWbemLocator> pLoc;
    HRESULT hr;

    hr = CoCreateInstance(CLSID_WbemLocator, 0, 
        CLSCTX_INPROC_SERVER, IID_IWbemLocator, (LPVOID *) &pLoc);

    if (FAILED(hr))
    {
        cout << "Failed to create IWbemLocator object. Err code = 0x"
             << std::hex << hr << endl;
        CoUninitialize();
        return hr;     // Program has failed.
    }

    // Connect to WMI through the IWbemLocator::ConnectServer method.
    ComPtr<IWbemServices> pSvc; // This will be saved as a private variable.
    // Connect to the root\default namespace with the current user.
    hr = pLoc->ConnectServer(
            BSTR(L"ROOT\\CIMV2"),  //namespace
            NULL,       // User name 
            NULL,       // User password
            0,         // Locale 
            NULL,     // Security flags
            0,         // Authority 
            0,        // Context object 
            &pSvc);   // IWbemServices proxy

    if (FAILED(hr))
    {
        cout << "Could not connect. Error code = 0x" 
             << std::hex << hr << endl;
        pLoc->Release();
        CoUninitialize();
        return hr;      // Program has failed.
    }

    cout << "Connected to WMI" << endl;

    // Set security levels on the proxy.
    // Set the proxy so that impersonation of the client occurs.
    hr = CoSetProxyBlanket(pSvc.Get(),
       RPC_C_AUTHN_WINNT,
       RPC_C_AUTHZ_NONE,
       NULL,
       RPC_C_AUTHN_LEVEL_CALL,
       RPC_C_IMP_LEVEL_IMPERSONATE,
       NULL,
       EOAC_NONE
    );

    if (FAILED(hr))
    {
        cout << "Could not set proxy blanket. Error code = 0x" 
             << std::hex << hr << endl;
        return hr;      // Program has failed.
    }
    
    this->pSvc = pSvc; // Save the IWbemServices pointer for everytime we want to query WMI.
    return S_OK; // Program successfully connected to WMI.
}
/**
 * WmiManager.cpp
 * * Implementation of WMI data retrieval using the IWbemRefresher interface.
 * Based on the "Initializing COM for a WMI Application" from Microsoft.
 * Reference: https://learn.microsoft.com/en-us/windows/win32/wmisdk/initializing-com-for-a-wmi-application
 */
HRESULT WmiManager::initialize() {
    HRESULT hr = initialize_com();
    if (FAILED(hr)) {
        return hr;
    }
    return connect_wmi(); // Connect to WMI and return the result (hr)
}


int WmiManager::get_physical_cpu_cores() {
    return this->cores;
}
std::string WmiManager::get_cpu_name() {
    return this->cpu_name;
}
unsigned int WmiManager::get_cpu_max_clock_speed() {
    return this->cpu_max_clock_speed;
}
std::string WmiManager::get_cpu_description() {
    return this->cpu_description;
}
std::string WmiManager::get_architecture() {
    return this->architecture;
}
float WmiManager::get_gpu_max_memory() {
    return this->gpu_max_memory;
}
std::string WmiManager::get_gpu_description() {
    return gpu_description;
}
float WmiManager::get_ram_max_memory() {
    return ram_max_memory;
}
unsigned int WmiManager::get_ram_max_speed() {
    return ram_max_speed;
}
std::string WmiManager::get_ram_description() {
    return ram_description;
}


// Helper function for converting a key value to a string for CPU architecture.
std::string WmiManager::convert_architecture_to_string(int arch) {
    switch(arch) {
        case 0:
            return "x86";
        case 1:
            return "MIPS";
        case 2:
            return "Alpha";
        case 3:
            return "PowerPC";
        case 5:
            return "ARM";
        case 6:
            return "ia64";
        case 9:
            return "x64";
        default:
            return "Unknown architecture.";
    }
}
/** 
 * General function for retrieving static data from WMI.
 * Queries for the given data type using WMI and saves the result in the correct private variable. 
 * @param type The type of data to retrieve, either CPU cores, CPU name, or CPU max clock speed.
 * @return S_OK if successful, or an error code if the query fails.
 * [IEnumWbemClassObject interface Documentation] (https://learn.microsoft.com/en-us/windows/win32/api/wbemcli/nn-wbemcli-ienumwbemclassobject)
 * [IWbemClassObject interface Documentation] (https://learn.microsoft.com/en-us/windows/win32/api/wbemcli/nn-wbemcli-iwbemclassobject)
 * [Windows Hardware Classes Documentation (different from CIM classes)] (https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/computer-system-hardware-classes)
 * [Win32_Processor Class Documentation] (https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-processor)
 */
HRESULT WmiManager::retrieve_static_data(DataType type) {
    // wstring is a wide string, so it can store wide characters (2 bytes).
    std::wstring wmi_property;
    std::wstring wmi_query;
    // Set the WMI query to the correct query based on the data type, resetting the private variables aswell.
    switch (type) {
        case DataType::CPU_CORES:
            wmi_property = L"NumberOfCores";
            this->cores = 0; // Reset core count.
            break;
        case DataType::CPU_NAME:
            wmi_property = L"Name";
            this->cpu_name = ""; // Reset CPU model.
            break;
        case DataType::CPU_MAX_CLOCK_SPEED:
            wmi_property = L"MaxClockSpeed";
            this->cpu_max_clock_speed = 0; // Reset CPU max clock speed.
            break;
        case DataType::CPU_DESCRIPTION:
            wmi_property = L"Description";
            this->cpu_description = ""; // Reset CPU description.
            break;
        case DataType::CPU_ARCHITECTURE:
            wmi_property = L"Architecture";
            this->architecture = ""; // Reset CPU architecture.
            break;
        case DataType::GPU_MAX_MEMORY:
            wmi_property = L"MaxMemory";
            this->gpu_max_memory = 0.0; // Reset GPU max memory.
            break;
        case DataType::GPU_DESCRIPTION:
            wmi_property = L"Description";
            this->gpu_description = ""; // Reset GPU description.
            break;
        case DataType::RAM_MAX_MEMORY:
            wmi_property = L"MaxMemory";
            this->ram_max_memory = 0.0; // Reset RAM max memory.
            break;
        case DataType::RAM_MAX_SPEED:
            wmi_property = L"MaxSpeed";
            this->ram_max_speed = 0; // Reset RAM max speed.
            break;
        case DataType::RAM_DESCRIPTION:
            wmi_property = L"Description";
            this->ram_description = ""; // Reset RAM description.
            break;

        default:
            cout << "Invalid data type." << endl;
            return E_INVALIDARG; // Invalid argument.
    }

    IEnumWbemClassObject* pEnum= NULL; // Enumerator for WMI query results, because queries return multiple results.

    // Create the WMI query (NOTE: currently only for CPU data).
    std::wstring query = L"SELECT " + wmi_property + L" FROM Win32_Processor";
    // pSvc is the IWbemServices ptr saved from initialization, used to query WMI.
    // bstr_t is a helper class for BSTR, which is a special string data type that COM needs.
    HRESULT hr = pSvc->ExecQuery(
        bstr_t("WQL"),
        bstr_t(query.c_str()),
        WBEM_FLAG_RETURN_IMMEDIATELY | WBEM_FLAG_FORWARD_ONLY,
        NULL,
        &pEnum
    );
    if (FAILED(hr)) {
        // Use wcout because wmi_property is a wide string (wstring).
        std::wcout << "Query for " << wmi_property << " failed. Error code = 0x" 
             << std::hex << hr << endl;
        return hr; // Failed to query WMI.
    }

    ULONG uTotal = 0;
    // Use a loop because some systems have multiple CPU's.
    for (;;) {
        IWbemClassObject* pObj = NULL;
        ULONG puReturned = 0;
        // Get the next result from the query (should only run once since my laptop has one CPU).
        hr = pEnum->Next(5000, 1, &pObj, &puReturned);

        if (puReturned == 0) {
            cout << "No more results." << endl;
            break; // No more results.
        }

        // The retrieval of the data.
        VARIANT pVal; // VARIANT is a special data type that can hold different types of data.
        hr = pObj->Get(wmi_property.c_str(), 0, &pVal, 0, 0); // L"" is used to signify that it is a string (its defaulted to a char).
        if (SUCCEEDED(hr)) {
            std::wcout << "Found a CPU with the WMI property: "<< wmi_property << " of: " << pVal.uintVal << "." << endl;
        } else {
            cout << "Failed to get name property. Error code = 0x" 
                 << std::hex << hr << endl;
        }

        // Set the correct private variable based on the data type.
        switch(type) {
            case DataType::CPU_CORES:
                this->cores += pVal.intVal; // Add the number of cores from this CPU to the total.
                break;
            case DataType::CPU_NAME:
                this->cpu_name = std::string(_bstr_t(pVal.bstrVal)); // Set the CPU name to the name from this CPU.
                break;
            case DataType::CPU_MAX_CLOCK_SPEED:
                this->cpu_max_clock_speed = pVal.uintVal; // Set the CPU max clock speed from this CPU.
                break;
            case DataType::CPU_DESCRIPTION:
                this->cpu_description = std::string(_bstr_t(pVal.bstrVal)); // Set the CPU description to the description from this CPU.
                break;
            case DataType::CPU_ARCHITECTURE:
                this->architecture = convert_architecture_to_string(pVal.intVal); // Convert the CPU architecture from this CPU to a string and save it.
                break;
            case DataType::GPU_MAX_MEMORY:
                this->gpu_max_memory += pVal.fltVal;
                break;
            case DataType::GPU_DESCRIPTION:
                this->gpu_description = std::string(_bstr_t(pVal.bstrVal));
                break;
            case DataType::RAM_MAX_MEMORY:
                this->ram_max_memory += pVal.fltVal;
                break;
            case DataType::RAM_MAX_SPEED:
                this->ram_max_speed += pVal.intVal;
                break;
            case DataType::RAM_DESCRIPTION:
                this->ram_description = std::string(_bstr_t(pVal.bstrVal));
                break;

            default:
                cout << "Invalid data type." << endl;
                return E_INVALIDARG; // Invalid argument.
        }
        
        pObj->Release(); // Release the object after we're done with it.
        VariantClear(&pVal); // Clear the VARIANT after we're done with it.
    }
    pEnum->Release(); // Release the enumerator after we're done with it.
    return S_OK; // Successfully retrieved the number of CPU cores.
}
