#include "hardware_json.h"
#include "WmiManager.h"

#include <iomanip>
#include <sstream>
#include <string>

namespace {

std::string json_escape(const std::string& s) {
    std::string r;
    r.reserve(s.size() + 8);
    for (unsigned char c : s) {
        switch (c) {
        case '"':
            r += "\\\"";
            break;
        case '\\':
            r += "\\\\";
            break;
        case '\n':
            r += "\\n";
            break;
        case '\r':
            r += "\\r";
            break;
        case '\t':
            r += "\\t";
            break;
        default:
            r += static_cast<char>(c);
            break;
        }
    }
    return r;
}

std::string jstr(const std::string& s) {
    return std::string("\"") + json_escape(s) + "\"";
}

std::string non_empty(const std::string& s) {
    return s.empty() ? std::string("Unknown") : s;
}

} // namespace

std::string wmi_snapshot_to_json(const WmiManager& wm) {
    const std::string cpu_model = non_empty(wm.get_cpu_name());
    std::string gpu_model = wm.get_gpu_name();
    if (gpu_model.empty()) {
        gpu_model = non_empty(wm.get_gpu_description());
    } else {
        gpu_model = non_empty(gpu_model);
    }
    const std::string ram_model = non_empty(wm.get_ram_description());

    std::ostringstream o;
    o << std::fixed << std::setprecision(2);

    o << '{'
      << "\"device\":{"
      << "\"device_name\":" << jstr(wm.get_device_name()) << ','
      << "\"os_type\":" << jstr(wm.get_os_caption()) << "},"
      << "\"components\":["
      << '{'
      << "\"category\":\"CPU\","
      << "\"model_name\":" << jstr(cpu_model) << ','
      << "\"max_value\":" << static_cast<double>(wm.get_cpu_max_clock_speed())
      << "},{"
      << "\"category\":\"GPU\","
      << "\"model_name\":" << jstr(gpu_model) << ','
      << "\"max_value\":" << static_cast<double>(wm.get_gpu_max_memory())
      << "},{"
      << "\"category\":\"RAM\","
      << "\"model_name\":" << jstr(ram_model) << ','
      << "\"max_value\":" << static_cast<double>(wm.get_ram_max_speed())
      << "}],"
      << "\"usage\":{"
      << "\"cpu_percent\":" << wm.get_cpu_usage_percent() << ','
      << "\"ram_percent\":" << wm.get_ram_usage_percent() << "}"
      << '}';
    return o.str();
}
