## References:

- [WMI Documentation] (https://learn.microsoft.com/en-us/windows/win32/wmisdk/creating-a-wmi-application-using-c-)
Used for COM initialization, including security setup. Used in WmiManager.cpp

- [ComPtr Documentation] (https://learn.microsoft.com/en-us/cpp/cppcx/wrl/comptr-class?view=msvc-170)
COM version of a smart pointer. Used in WmiManager.cpp

- [Hardware Class Names (CIM Classes)] (https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/computer-system-hardware-classes)
All of the class names of hardware components.

- [Windows Hardware Classes] (https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/computer-system-hardware-classes)
Inherit from CIM Classes; Specific to win32 machines, for example Win32_Processor.

- [Executing Queries] (https://learn.microsoft.com/en-us/windows/win32/api/wbemcli/nf-wbemcli-iwbemservices-execquery)
WMI Documentation for ExecQuery. Used in WmiManager.cpp



Note: In my WmiManager.cpp implementations for retrieving hardware data, although I used a loop to find all available processors for cpu, the program doesn't support multiple cpu's. This is because I created only a single private variable for each property, so, for example, if there were multiple cpus, then the manufacturer for the second cpu would replace the value for the first cpu. This doesn't matter for most consumer computers since most only have one cpu, including my laptop which will have the demo.