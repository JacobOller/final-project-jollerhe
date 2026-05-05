#ifndef HARDWARE_JSON_H
#define HARDWARE_JSON_H

#include <string>

class WmiManager;

// JSON format of the device info; not yet implemented automatic transfer into database,
// so the user must copy and paste this info into the ui when creating an account.
// NOTE: This function was mainly created by Gemini Pro, as it was purely formatting the data into a JSON string.
/**
 * JSON: { "device": { device_name, os_type }, "components": [ { category, model_name, max_value }, ... ], "usage": { ... } }.
 * device / components match your Device and Component columns (ids come from the database).
 */
std::string wmi_snapshot_to_json(const WmiManager& wm);

#endif
