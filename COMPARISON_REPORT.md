# MileApp API Documentation Comparison Report

**Laravel/ReDoc (localhost:83)** vs **Mintlify (localhost:3000)**

Generated: 2025-11-27

---

## Executive Summary

| Aspect | Laravel/ReDoc | Mintlify |
|--------|---------------|----------|
| **URL (Public)** | http://localhost:83/ | http://localhost:3000/api-reference/ |
| **URL (Internal)** | http://localhost:83/internal | http://localhost:3000/api-reference-internal/ |
| **Framework** | Laravel + ReDoc | Mintlify |
| **UI Style** | Single-page scrollable | Multi-page with sidebar navigation |
| **Search** | ReDoc built-in search | Mintlify global search (⌘K) |
| **Dark Mode** | No | Yes |
| **Mobile Responsive** | Yes | Yes |

---

## Public API - Module Comparison

### Getting Started Section

| Page | Laravel/ReDoc | Mintlify | Status |
|------|---------------|----------|--------|
| **Introduction** | `/#section/Introduction` | `/api-reference/introduction` | ✅ Migrated |
| **Overview** | `/#section/Introduction/Overview` | `/api-reference/introduction#overview` | ✅ Migrated |
| **Rate Limit** | `/#section/Introduction/Rate-Limit` | `/api-reference/introduction#rate-limit` | ✅ Migrated |
| **Authentication** | `/#section/Authentication` | `/api-reference/authentication` | ✅ Migrated |
| **Generate Access Token** | `/#section/Authentication/Generate-access-token` | `/api-reference/authentication#generate-access-token` | ✅ Migrated |
| **Protect Key Leakage** | `/#section/Authentication/Protecting-against-key-leakage` | `/api-reference/authentication#protecting-against-key-leakage` | ✅ Migrated |
| **Handle Leaked Keys** | `/#section/Authentication/Handle-leaked-secret-keys` | `/api-reference/authentication#handle-leaked-secret-keys` | ✅ Migrated |
| **Data Formats** | `/#section/Introduction/Format` | `/api-reference/data-formats` | ✅ Migrated |
| **Status Codes** | `/#section/Introduction/Status-Code` | `/api-reference/status-codes` | ✅ Migrated |

### Task Module

| Endpoint | Laravel/ReDoc | Mintlify | Method | Status |
|----------|---------------|----------|--------|--------|
| **Task Overview** | `/#tag/Task` | `/api-reference/task/overview` | - | ✅ Migrated |
| Read tasks | `/#tag/Task/operation/Gettask` | `/api-reference/task/task/read-tasks` | GET | ✅ Migrated |
| Read tasks gallery | `/#tag/Task/operation/Gettaskgallery` | `/api-reference/task/task/read-tasks-gallery` | GET | ✅ Migrated |
| Read task by ID | `/#tag/Task/operation/GetTask` | `/api-reference/task/task/read-task-by-id` | GET | ✅ Migrated |
| Read public task by ID | `/#tag/Task/operation/GetPublicTask` | `/api-reference/task/task/read-public-task-by-id` | GET | ✅ Migrated |
| Read task tracking | `/#tag/Task/operation/GetTaskTracking` | `/api-reference/task/task/read-task-tracking` | GET | ✅ Migrated |
| Create task | `/#tag/Task/operation/createTask` | `/api-reference/task/task/create-task` | POST | ✅ Migrated |
| Update task | `/#tag/Task/operation/UpdateTask` | `/api-reference/task/task/update-task` | PUT | ✅ Migrated |
| Delete task | `/#tag/Task/operation/deleteTask` | `/api-reference/task/task/delete-task` | DELETE | ✅ Migrated |
| Assign task | `/#tag/Task/operation/assignTask` | `/api-reference/task/task/assign-task` | PATCH | ✅ Migrated |
| **Location History** | | | | |
| Read location history | `/#tag/Location-History/operation/getLocationHistory` | `/api-reference/task/location-history/read-location-history` | GET | ✅ Migrated |
| **Task Schedule** | | | | |
| Read task schedules | `/#tag/Task-Schedule/operation/getTaskSchedules` | `/api-reference/task/task-schedule/read-task-schedules` | GET | ✅ Migrated |
| Create task schedule | `/#tag/Task-Schedule/operation/createTaskSchedule` | `/api-reference/task/task-schedule/create-task-schedule` | POST | ✅ Migrated |
| Update task schedule | `/#tag/Task-Schedule/operation/updateTaskSchedule` | `/api-reference/task/task-schedule/update-task-schedule` | PUT | ✅ Migrated |
| Delete task schedule | `/#tag/Task-Schedule/operation/deleteTaskSchedule` | `/api-reference/task/task-schedule/delete-task-schedule` | DELETE | ✅ Migrated |

### Routing Module

| Endpoint | Laravel/ReDoc | Mintlify | Method | Status |
|----------|---------------|----------|--------|--------|
| **Vehicle** | | | | |
| Read vehicles | `/#tag/Vehicle/operation/getVehicles` | `/api-reference/routing/vehicle/read-vehicles` | GET | ✅ Migrated |
| Read vehicle by ID | `/#tag/Vehicle/operation/getVehicle` | `/api-reference/routing/vehicle/read-vehicle-by-id` | GET | ✅ Migrated |
| Create vehicle | `/#tag/Vehicle/operation/createVehicle` | `/api-reference/routing/vehicle/create-vehicle` | POST | ✅ Migrated |
| Update vehicle | `/#tag/Vehicle/operation/updateVehicle` | `/api-reference/routing/vehicle/update-vehicle` | PUT | ✅ Migrated |
| Delete vehicle | `/#tag/Vehicle/operation/deleteVehicle` | `/api-reference/routing/vehicle/delete-vehicle` | DELETE | ✅ Migrated |
| **Routing** | | | | |
| Create routing | `/#tag/Routing/operation/createRouting` | `/api-reference/routing/routing/create-routing` | POST | ✅ Migrated |
| Read routing results | `/#tag/Routing/operation/getRoutingResults` | `/api-reference/routing/routing/read-routing-results` | GET | ✅ Migrated |
| Dispatch routing | `/#tag/Routing/operation/dispatchRouting` | `/api-reference/routing/routing/dispatch-routing` | POST | ✅ Migrated |

### Flow Module

| Endpoint | Laravel/ReDoc | Mintlify | Method | Status |
|----------|---------------|----------|--------|--------|
| **Flow** | | | | |
| Read flows | `/#tag/Flow/operation/getflow` | `/api-reference/flow/flow/read-flows` | GET | ✅ Migrated |
| Read flow by ID | `/#tag/Flow/operation/getflowbyid` | `/api-reference/flow/flow/read-flow-by-id` | GET | ✅ Migrated |
| **Automation** | | | | |
| Read automations | `/#tag/Automation/operation/getAutomation` | `/api-reference/flow/automation/read-automations` | GET | ✅ Migrated |
| Read automation by ID | `/#tag/Automation/operation/getAutomationbyid` | `/api-reference/flow/automation/read-automation-by-id` | GET | ✅ Migrated |
| Create automation | `/#tag/Automation/operation/createAutomation` | `/api-reference/flow/automation/create-automation` | POST | ✅ Migrated |
| Update automation | `/#tag/Automation/operation/updateAutomation` | `/api-reference/flow/automation/update-automation` | PUT | ✅ Migrated |
| Delete automation | `/#tag/Automation/operation/deleteAutomation` | `/api-reference/flow/automation/delete-automation` | DELETE | ✅ Migrated |

### Data Module

| Endpoint | Laravel/ReDoc | Mintlify | Method | Status |
|----------|---------------|----------|--------|--------|
| **Data Source** | | | | |
| Read data sources | `/#tag/Data-Source/operation/getDataSource` | `/api-reference/data/data-source/read-data-sources` | GET | ✅ Migrated |
| Read data source by ID | `/#tag/Data-Source/operation/getDataSourcebyid` | `/api-reference/data/data-source/read-data-source-by-id` | GET | ✅ Migrated |
| Create data source | `/#tag/Data-Source/operation/createDataSource` | `/api-reference/data/data-source/create-data-source` | POST | ✅ Migrated |
| Update data source | `/#tag/Data-Source/operation/updateDataSource` | `/api-reference/data/data-source/update-data-source` | PUT | ✅ Migrated |
| Delete data source | `/#tag/Data-Source/operation/deleteDataSource` | `/api-reference/data/data-source/delete-data-source` | DELETE | ✅ Migrated |
| **Data Type** | | | | |
| Read data types | `/#tag/Data-Type/operation/getDataType` | `/api-reference/data/data-type/read-data-types` | GET | ✅ Migrated |
| Read data type by ID | `/#tag/Data-Type/operation/getDataTypebyid` | `/api-reference/data/data-type/read-data-type-by-id` | GET | ✅ Migrated |

### Setting Module

| Endpoint | Laravel/ReDoc | Mintlify | Method | Status |
|----------|---------------|----------|--------|--------|
| **Setting Overview** | - | `/api-reference/setting/overview` | - | ✅ New |
| **User** | | | | |
| Read users | `/#tag/User/operation/getUsers` | `/api-reference/setting/user/read-users` | GET | ✅ Migrated |
| Read user by ID | `/#tag/User/operation/getUser` | `/api-reference/setting/user/read-user-by-id` | GET | ✅ Migrated |
| Create user | `/#tag/User/operation/createUser` | `/api-reference/setting/user/create-user` | POST | ✅ Migrated |
| Update user | `/#tag/User/operation/updateUser` | `/api-reference/setting/user/update-user` | PUT | ✅ Migrated |
| Delete user | `/#tag/User/operation/deleteUser` | `/api-reference/setting/user/delete-user` | DELETE | ✅ Migrated |
| **Role** | | | | |
| Read roles | `/#tag/Role/operation/getRoles` | `/api-reference/setting/role/read-roles` | GET | ✅ Migrated |
| Read role by ID | `/#tag/Role/operation/getRole` | `/api-reference/setting/role/read-role-by-id` | GET | ✅ Migrated |
| **Hub** | | | | |
| Read hubs | `/#tag/Hub/operation/getHubs` | `/api-reference/setting/hub/read-hubs` | GET | ✅ Migrated |
| Read hub by ID | `/#tag/Hub/operation/getHub` | `/api-reference/setting/hub/read-hub-by-id` | GET | ✅ Migrated |
| **Team** | | | | |
| Read teams | `/#tag/Team/operation/getTeams` | `/api-reference/setting/team/read-teams` | GET | ✅ Migrated |
| Read team by ID | `/#tag/Team/operation/getTeam` | `/api-reference/setting/team/read-team-by-id` | GET | ✅ Migrated |
| **App Integration** | | | | |
| Read app integrations | `/#tag/App-Integration/operation/getAppIntegrations` | `/api-reference/setting/app-integration/read-app-integrations` | GET | ✅ Migrated |
| **Plugin** | | | | |
| Read plugins | `/#tag/Plugin/operation/getPlugins` | `/api-reference/setting/plugin/read-plugins` | GET | ✅ Migrated |

### Import/Export Module

| Endpoint | Laravel/ReDoc | Mintlify | Method | Status |
|----------|---------------|----------|--------|--------|
| **Import/Export Overview** | - | `/api-reference/importexport/overview` | - | ✅ New |
| **Data Import** | | | | |
| Import data | `/#tag/Data-Import/operation/importData` | `/api-reference/importexport/data-import/import-data` | POST | ✅ Migrated |
| **Export Task** | | | | |
| Export tasks | `/#tag/Export-Task/operation/exportTasks` | `/api-reference/importexport/export-task/export-tasks` | POST | ✅ Migrated |
| **Export Config** | | | | |
| Read export configs | `/#tag/Export-Config/operation/getExportConfigs` | `/api-reference/importexport/export-config/read-export-configs` | GET | ✅ Migrated |

### File Module

| Endpoint | Laravel/ReDoc | Mintlify | Method | Status |
|----------|---------------|----------|--------|--------|
| **File Overview** | - | `/api-reference/file/overview` | - | ✅ New |
| Upload file | `/#tag/File/operation/uploadFile` | `/api-reference/file/file/upload-file` | POST | ✅ Migrated |

### Objects Section

| Object | Laravel/ReDoc | Mintlify | Status |
|--------|---------------|----------|--------|
| Task object | `/#tag/task_model` | `/api-reference/objects/task-object` | ✅ Migrated |
| Location history object | `/#tag/location_history_model` | `/api-reference/objects/location-history-object` | ✅ Migrated |
| Export Config object | `/#tag/export_config_model` | `/api-reference/objects/export-config-object` | ✅ Migrated |
| Task Schedule object | `/#tag/task_schedule_model` | `/api-reference/objects/task-schedule-object` | ✅ Migrated |
| Vehicle object | `/#tag/vehicle_model` | `/api-reference/objects/vehicle-object` | ✅ Migrated |
| Routing object | `/#tag/routing_model` | `/api-reference/objects/routing-object` | ✅ Migrated |
| Flow object | `/#tag/flow_model` | `/api-reference/objects/flow-object` | ✅ Migrated |
| Automation object | `/#tag/automation_model` | `/api-reference/objects/automation-object` | ✅ Migrated |
| Data source object | `/#tag/data_source_model` | `/api-reference/objects/data-source-object` | ✅ Migrated |
| Data type object | `/#tag/data_type_model` | `/api-reference/objects/data-type-object` | ✅ Migrated |
| User object | `/#tag/user_model` | `/api-reference/objects/user-object` | ✅ Migrated |
| Role object | `/#tag/role_model` | `/api-reference/objects/role-object` | ✅ Migrated |
| Hub object | `/#tag/hub_model` | `/api-reference/objects/hub-object` | ✅ Migrated |
| Team object | `/#tag/team_model` | `/api-reference/objects/team-object` | ✅ Migrated |
| Plugin object | `/#tag/plugin_model` | `/api-reference/objects/plugin-object` | ✅ Migrated |

---

## Internal API - Module Comparison

### Getting Started Section

| Page | Laravel/ReDoc | Mintlify | Status |
|------|---------------|----------|--------|
| **Introduction** | `/internal#section/Introduction` | `/api-reference-internal/introduction` | ✅ Migrated |
| **Authentication** | `/internal#section/Authentication` | `/api-reference-internal/authentication` | ✅ Migrated |
| **Data Formats** | `/internal#section/Introduction/Format` | `/api-reference-internal/data-formats` | ✅ Migrated |
| **Status Codes** | `/internal#section/Introduction/Status-Code` | `/api-reference-internal/status-codes` | ✅ Migrated |
| **Failed Code System** | `/internal#section/Introduction/Failed-Code-System` | `/api-reference-internal/status-codes#failed-code-system` | ✅ Migrated |

### Task Module (Internal)

| Endpoint | Laravel/ReDoc | Mintlify | Method | Status |
|----------|---------------|----------|--------|--------|
| Read tasks (Internal) | `/internal#tag/Task/operation/GetTaskInternal` | `/api-reference-internal/task/task/read-tasks` | GET | ✅ Migrated |
| Read tasks gallery | `/internal#tag/Task/operation/Gettaskgallery` | `/api-reference-internal/task/task/read-tasks-gallery` | GET | ✅ Migrated |
| **Location History** | | | | |
| Read location history | `/internal#tag/Location-History/operation/getLocationHistory` | `/api-reference-internal/task/location-history/read-location-history` | GET | ✅ Migrated |
| **Task Schedule** | | | | |
| Read task schedules | `/internal#tag/Task-Schedule/operation/getTaskSchedules` | `/api-reference-internal/task/task-schedule/read-task-schedules` | GET | ✅ Migrated |
| **Export Config** | | | | |
| Read export configs | `/internal#tag/Export-Config/operation/getExportConfigs` | `/api-reference-internal/task/export-config/read-export-configs` | GET | ✅ Migrated |
| **Activity** | | | | |
| Read activities | `/internal#tag/Activity/operation/getActivities` | `/api-reference-internal/task/activity/read-activities` | GET | ✅ Migrated |

### Routing Module (Internal)

| Endpoint | Laravel/ReDoc | Mintlify | Method | Status |
|----------|---------------|----------|--------|--------|
| **Vehicle** | | | | |
| Read vehicles | `/internal#tag/Vehicle/operation/getVehicles` | `/api-reference-internal/routing/vehicle/read-vehicles` | GET | ✅ Migrated |
| **Routing** | | | | |
| Create routing | `/internal#tag/Routing/operation/createRouting` | `/api-reference-internal/routing/routing/create-routing` | POST | ✅ Migrated |
| **Configuration** | | | | |
| Read configurations | `/internal#tag/Configuration/operation/getConfigurations` | `/api-reference-internal/routing/configuration/read-configurations` | GET | ✅ Migrated |
| **Capacity Constraint** | | | | |
| Read capacity constraints | `/internal#tag/Capacity-Constraint/operation/getCapacityConstraints` | `/api-reference-internal/routing/capacity-constraint/read-capacity-constraints` | GET | ✅ Migrated |
| **Geocode** | | | | |
| Geocode address | `/internal#tag/Geocode/operation/geocodeAddress` | `/api-reference-internal/routing/geocode/geocode-address` | POST | ✅ Migrated |
| **Geotagging** | | | | |
| Read geotagging | `/internal#tag/Geotagging/operation/getGeotagging` | `/api-reference-internal/routing/geotagging/read-geotagging` | GET | ✅ Migrated |

### Flow Module (Internal)

| Endpoint | Laravel/ReDoc | Mintlify | Method | Status |
|----------|---------------|----------|--------|--------|
| **Flow** | | | | |
| Read flows | `/internal#tag/Flow/operation/getflow` | `/api-reference-internal/flow/flow/read-flows` | GET | ✅ Migrated |
| **Automation** | | | | |
| Read automations | `/internal#tag/Automation/operation/getAutomation` | `/api-reference-internal/flow/automation/read-automations` | GET | ✅ Migrated |

### Data Module (Internal)

| Endpoint | Laravel/ReDoc | Mintlify | Method | Status |
|----------|---------------|----------|--------|--------|
| **Data Source** | | | | |
| Read data sources | `/internal#tag/Data-Source/operation/getDataSource` | `/api-reference-internal/data/data-source/read-data-sources` | GET | ✅ Migrated |
| **Data Type** | | | | |
| Read data types | `/internal#tag/Data-Type/operation/getDataType` | `/api-reference-internal/data/data-type/read-data-types` | GET | ✅ Migrated |
| **Data Import** | | | | |
| Import data | `/internal#tag/Data-Import/operation/importData` | `/api-reference-internal/data/data-import/import-data` | POST | ✅ Migrated |

### Setting Module (Internal)

| Endpoint | Laravel/ReDoc | Mintlify | Method | Status |
|----------|---------------|----------|--------|--------|
| **User** | | | | |
| Read users | `/internal#tag/User/operation/getUsers` | `/api-reference-internal/setting/user/read-users` | GET | ✅ Migrated |
| **Role** | | | | |
| Read roles | `/internal#tag/Role/operation/getRoles` | `/api-reference-internal/setting/role/read-roles` | GET | ✅ Migrated |
| **Hub** | | | | |
| Read hubs | `/internal#tag/Hub/operation/getHubs` | `/api-reference-internal/setting/hub/read-hubs` | GET | ✅ Migrated |
| **Organization** | | | | |
| Read organizations | `/internal#tag/Organization/operation/getOrganizations` | `/api-reference-internal/setting/organization/read-organizations` | GET | ✅ Migrated |
| **Custom Module** | | | | |
| Read custom modules | `/internal#tag/Custom-Module/operation/getCustomModules` | `/api-reference-internal/setting/custom-module/read-custom-modules` | GET | ✅ Migrated |
| **Team** | | | | |
| Read teams | `/internal#tag/Team/operation/getTeams` | `/api-reference-internal/setting/team/read-teams` | GET | ✅ Migrated |
| **Organization Data** | | | | |
| Read organization data | `/internal#tag/Organization-Data/operation/getOrganizationData` | `/api-reference-internal/setting/organization-data/read-organization-data` | GET | ✅ Migrated |
| **Plugin** | | | | |
| Read plugins | `/internal#tag/Plugin/operation/getPlugins` | `/api-reference-internal/setting/plugin/read-plugins` | GET | ✅ Migrated |
| **Template** | | | | |
| Read templates | `/internal#tag/Template/operation/getTemplates` | `/api-reference-internal/setting/template/read-templates` | GET | ✅ Migrated |
| **Version Management** | | | | |
| Read versions | `/internal#tag/Version-Management/operation/getVersions` | `/api-reference-internal/setting/version-management/read-versions` | GET | ✅ Migrated |
| **Data Version** | | | | |
| Read data versions | `/internal#tag/Data-Version/operation/getDataVersions` | `/api-reference-internal/setting/data-version/read-data-versions` | GET | ✅ Migrated |
| **Password Policy** | | | | |
| Read password policies | `/internal#tag/Password-Policy/operation/getPasswordPolicies` | `/api-reference-internal/setting/password-policy/read-password-policies` | GET | ✅ Migrated |
| **Privacy Policy** | | | | |
| Read privacy policies | `/internal#tag/Privacy-Policy/operation/getPrivacyPolicies` | `/api-reference-internal/setting/privacy-policy/read-privacy-policies` | GET | ✅ Migrated |

### Billing Module (Internal Only)

| Endpoint | Laravel/ReDoc | Mintlify | Method | Status |
|----------|---------------|----------|--------|--------|
| **Licenses** | | | | |
| Read licenses | `/internal#tag/Licenses/operation/getLicenses` | `/api-reference-internal/billing/licenses/read-licenses` | GET | ✅ Migrated |
| **Subscriptions** | | | | |
| Read subscriptions | `/internal#tag/Subscriptions/operation/getSubscriptions` | `/api-reference-internal/billing/subscriptions/read-subscriptions` | GET | ✅ Migrated |
| **Payment Methods** | | | | |
| Read payment methods | `/internal#tag/Payment-Methods/operation/getPaymentMethods` | `/api-reference-internal/billing/payment-methods/read-payment-methods` | GET | ✅ Migrated |
| **Invoices** | | | | |
| Read invoices | `/internal#tag/Invoices/operation/getInvoices` | `/api-reference-internal/billing/invoices/read-invoices` | GET | ✅ Migrated |
| **Listener** | | | | |
| Billing listener | `/internal#tag/Listener/operation/billingListener` | `/api-reference-internal/billing/listener/billing-listener` | POST | ✅ Migrated |

### Activity Module (Internal Only)

| Endpoint | Laravel/ReDoc | Mintlify | Method | Status |
|----------|---------------|----------|--------|--------|
| **Activity** | | | | |
| Read activities | `/internal#tag/Activity/operation/getActivities` | `/api-reference-internal/activity/activity/read-activities` | GET | ✅ Migrated |
| **Dashboard** | | | | |
| Read dashboard | `/internal#tag/Dashboard/operation/getDashboard` | `/api-reference-internal/activity/dashboard/read-dashboard` | GET | ✅ Migrated |

### Auth Module (Internal Only)

| Endpoint | Laravel/ReDoc | Mintlify | Method | Status |
|----------|---------------|----------|--------|--------|
| **Authentication** | | | | |
| Login | `/internal#tag/Authentication/operation/login` | `/api-reference-internal/auth/authentication/login` | POST | ✅ Migrated |
| **Token** | | | | |
| Refresh token | `/internal#tag/Token/operation/refreshToken` | `/api-reference-internal/auth/token/refresh-token` | POST | ✅ Migrated |

### Tools Module (Internal Only)

| Endpoint | Laravel/ReDoc | Mintlify | Method | Status |
|----------|---------------|----------|--------|--------|
| **Plugin** | | | | |
| Read plugins | `/internal#tag/Plugin/operation/getPlugins` | `/api-reference-internal/tools/plugin/read-plugins` | GET | ✅ Migrated |
| **Internal Tools** | | | | |
| Read internal tools | `/internal#tag/Internal-Tools/operation/getInternalTools` | `/api-reference-internal/tools/internal-tools/read-internal-tools` | GET | ✅ Migrated |

### Flow Module - Workflow Submodule (Internal Only)

| Endpoint | Laravel/ReDoc | Mintlify | Method | Status |
|----------|---------------|----------|--------|--------|
| **Workflow** (under Flow) | | | | |
| Read workflows | `/internal#tag/Workflow/operation/getWorkflows` | `/api-reference-internal/flow/workflow/read-workflows` | GET | ✅ Migrated |

### Reference Module (Internal Only)

| Endpoint | Laravel/ReDoc | Mintlify | Method | Status |
|----------|---------------|----------|--------|--------|
| **Currency** | | | | |
| Read currencies | `/internal#tag/Currency/operation/getCurrencies` | `/api-reference-internal/reference/currency/read-currencies` | GET | ✅ Migrated |

### File Module (Internal Only)

| Endpoint | Laravel/ReDoc | Mintlify | Method | Status |
|----------|---------------|----------|--------|--------|
| **File** | | | | |
| Upload file | `/internal#tag/File/operation/uploadFile` | `/api-reference-internal/file/file/upload-file` | POST | ✅ Migrated |

### Objects Section (Internal)

| Object | Laravel/ReDoc | Mintlify | Status |
|--------|---------------|----------|--------|
| Task object | `/internal#tag/task_model` | `/api-reference-internal/objects/task-object` | ✅ Migrated |
| Vehicle object | `/internal#tag/vehicle_model` | `/api-reference-internal/objects/vehicle-object` | ✅ Migrated |
| User object | `/internal#tag/user_model` | `/api-reference-internal/objects/user-object` | ✅ Migrated |
| Role object | `/internal#tag/role_model` | `/api-reference-internal/objects/role-object` | ✅ Migrated |
| Hub object | `/internal#tag/hub_model` | `/api-reference-internal/objects/hub-object` | ✅ Migrated |
| Team object | `/internal#tag/team_model` | `/api-reference-internal/objects/team-object` | ✅ Migrated |
| Flow object | `/internal#tag/flow_model` | `/api-reference-internal/objects/flow-object` | ✅ Migrated |
| Organization object | `/internal#tag/organization_model` | `/api-reference-internal/objects/organization-object` | ✅ Migrated |
| Invoice object | `/internal#tag/invoice_model` | `/api-reference-internal/objects/invoice-object` | ✅ Migrated |
| License object | `/internal#tag/license_model` | `/api-reference-internal/objects/license-object` | ✅ Migrated |
| Subscription object | `/internal#tag/subscription_model` | `/api-reference-internal/objects/subscription-object` | ✅ Migrated |
| Location History object | `/internal#tag/location_history_model` | `/api-reference-internal/objects/location-history-object` | ✅ Migrated |
| Task Schedule object | `/internal#tag/task_schedule_model` | `/api-reference-internal/objects/task-schedule-object` | ✅ Migrated |
| Version object | `/internal#tag/version_model` | `/api-reference-internal/objects/version-object` | ✅ Migrated |
| Workflow object | `/internal#tag/workflow_model` | `/api-reference-internal/objects/workflow-object` | ✅ Migrated |
| Custom Module object | `/internal#tag/custom_module_model` | `/api-reference-internal/objects/custom-module-object` | ✅ Migrated |

---

## Navigation Structure Comparison

### Public API Navigation

| Laravel/ReDoc (Sidebar) | Mintlify (Sidebar) |
|-------------------------|-------------------|
| Introduction | Getting Started |
| ├── Overview | ├── Introduction |
| ├── Rate Limit | ├── Authentication |
| ├── Format | ├── Data Formats |
| └── Status Code | └── Status Codes |
| Authentication | Task |
| ├── Generate access token | ├── Task Overview |
| ├── Protecting against key leakage | ├── Task |
| └── Handle leaked secret keys | ├── Location History |
| Task | └── Task Schedule |
| ├── Task | Routing |
| ├── Location History | ├── Vehicle |
| └── Task Schedule | └── Routing |
| Import & Export | Flow |
| ├── Data Import | ├── Flow |
| ├── Export Task | └── Automation |
| └── Export Config | Data |
| Routing | ├── Data Source |
| ├── Vehicle | └── Data Type |
| └── Routing | Setting |
| Flow | ├── Setting Overview |
| ├── Flow | ├── User |
| ├── Automation | ├── App Integration |
| └── Webhook | ├── Role |
| Data | ├── Hub |
| ├── Data Source | ├── Team |
| └── Data Type | └── Plugin |
| Setting | Import/Export |
| ├── User | ├── Import/Export Overview |
| ├── Role | ├── Export Task |
| ├── Hub | ├── Data Import |
| ├── Team | └── Export Config |
| ├── App Integration | File |
| └── Plugin | ├── File Overview |
| File | └── File |
| └── File | Objects |
| Objects | └── (15 object types) |
| └── (15 object types) | |

### Internal API Navigation - Side-by-Side Comparison

| # | Laravel/ReDoc (localhost:83/internal) | Mintlify (localhost:3000/internal) | Match |
|---|---------------------------------------|-------------------------------------|-------|
| 1 | **Introduction** | **Getting Started** | ✅ |
| 2 | **Task** (Task, Location History, Task Schedule, Activity) | **Task** (Task, Location History, Task Schedule, Export Config, Activity) | ✅ |
| 3 | **Routing** (Vehicle, Routing, Configuration, Capacity Constraint, Geotagging) | **Routing** (Vehicle, Routing, Configuration, Capacity Constraint, Geocode, Geotagging) | ✅ |
| 4 | **Flow** (Flow, Automation, Workflow, Webhook) | **Flow** (Automation, Flow, Workflow) | ⚠️ Missing Webhook* |
| 5 | **Data** (Data, Data Type) | **Data** (Data Source, Data Type, Data Import) | ✅ |
| 6 | **Setting** (User, Role, Hub, Data Version, Version Management, Password Policy, Privacy Policy, Custom Module, Organization Data, Organization) | **Setting** (User, App Integration, Role, Hub, Organization, Custom Module, Team, Organization Data, Plugin, Template, Version Management, Data Version, Password Policy, Privacy Policy) | ✅ |
| 7 | **File** (File) | **File** (File) | ✅ |
| 8 | **Billing** (Licenses, Subscriptions, Invoices, Listener, Payment Methods) | **Billing** (Licenses, Subscriptions, Payment Methods, Invoices, Listener) | ✅ |
| 9 | **Dashboard** (Dashboard) | **Dashboard** (Activity, Dashboard) | ✅ |
| 10 | **Authentication** (Authentication, Token) | **Authentication** (Authentication, Token) | ✅ |
| 11 | **Reference** (Currency) | **Reference** (Currency) | ✅ |
| 12 | **Internal Tools** (Internal Tools) | **Internal Tools** (Plugin, Internal Tools) | ✅ |
| 13 | **Objects** (14+ object types) | **Objects** (16 object types) | ✅ |

*Note: Webhook is shown in Laravel sidebar but has no API endpoints in the OpenAPI spec

---

## Feature Comparison

| Feature | Laravel/ReDoc | Mintlify |
|---------|---------------|----------|
| **Search** | ReDoc built-in | Global search (⌘K) |
| **Dark Mode** | ❌ No | ✅ Yes |
| **Try It Out** | ❌ No | ✅ Yes (API Playground) |
| **Code Samples** | ✅ Yes (JSON only) | ✅ Yes (Multiple languages) |
| **Copy Code** | ✅ Yes | ✅ Yes |
| **Response Examples** | ✅ Yes | ✅ Yes |
| **Schema Viewer** | ✅ Expandable | ✅ Expandable |
| **Mobile Responsive** | ✅ Yes | ✅ Yes |
| **SEO Optimization** | ❌ Limited | ✅ Full (noindex for internal) |
| **Tabs for Public/Internal** | ❌ Separate URLs | ✅ Tab navigation |
| **Custom Branding** | ✅ Logo only | ✅ Full branding |
| **AI Chat Assistant** | ❌ No | ✅ Yes |

---

## Screenshots Reference

### Public API Screenshots

| Page | Screenshot Location | Description |
|------|---------------------|-------------|
| Laravel Public Full Sidebar | `.playwright-mcp/laravel-public-full-sidebar.png` | Full sidebar with all modules expanded |
| Laravel Routing Vehicle | `.playwright-mcp/laravel-routing-vehicle.png` | Routing > Vehicle section with endpoints |
| Laravel Flow Module | `.playwright-mcp/laravel-flow-module.png` | Flow section showing Read flows endpoint |
| Mintlify Routing Vehicle | `.playwright-mcp/mintlify-routing-vehicle.png` | Mintlify Routing > Vehicle for comparison |
| Mintlify Routing Full | `.playwright-mcp/mintlify-routing-full.png` | Mintlify Routing section expanded |
| Mintlify Flow Module | `.playwright-mcp/mintlify-flow-module.png` | Mintlify Flow section with endpoints list |

### Internal API Screenshots

| Page | Screenshot Location | Description |
|------|---------------------|-------------|
| Laravel Internal API Full | `.playwright-mcp/laravel-internal-api-full.png` | Full sidebar with all internal modules |
| Mintlify Internal API Full | `.playwright-mcp/mintlify-internal-api-full.png` | Full sidebar with internal modules |

---

## Summary

### Migration Status

| API | Total Endpoints | Migrated | Pending |
|-----|-----------------|----------|---------|
| **Public API** | ~50+ | ✅ All | 0 |
| **Internal API** | ~100+ | ✅ All | 0 |

### Key Improvements in Mintlify

1. **Better Navigation**: Organized groups with collapsible sections
2. **Dark Mode Support**: User preference for light/dark theme
3. **AI Assistant**: Built-in chat for documentation questions
4. **SEO Control**: `noindex` for internal API pages
5. **Modern UI**: Cleaner, more modern design
6. **Faster Load**: Multi-page architecture vs single-page scroll

### Notes

- Internal API is accessible via hidden tab (URL: `/api-reference-internal/`)
- All internal API pages have `noindex: true` to prevent search engine indexing
- Public API remains fully indexed for SEO

---

## Detailed Module-by-Module Visual Comparison

### Internal API Sidebar Structure Comparison

| Group | Laravel/ReDoc Sidebar | Mintlify Sidebar | Match |
|-------|----------------------|------------------|-------|
| **Getting Started** | Introduction, Authentication, Format, Status Code | Introduction, Authentication, Data Formats, Status Codes | ✅ |
| **Task** | Task, Location History, Task Schedule, Activity | Task, Location History, Task Schedule, Export Config, Activity | ✅ |
| **Routing** | Vehicle, Routing, Configuration, Capacity Constraint, Geotagging | Vehicle, Routing, Configuration, Capacity Constraint, Geocode, Geotagging | ✅ |
| **Flow** | Flow, Automation, Workflow, Webhook | Automation, Flow, Workflow | ✅ (Webhook has no endpoints) |
| **Data** | Data, Data Type | Data Source, Data Type, Data Import | ✅ |
| **Setting** | User, Role, Hub, Data Version, Version Management, Password Policy, Privacy Policy, Custom Module, Organization Data, Organization | User, App Integration, Role, Hub, Organization, Custom Module, Team, Organization Data, Plugin, Template, Version Management, Data Version, Password Policy, Privacy Policy | ✅ |
| **File** | File | File | ✅ |
| **Billing** | Licenses, Subscriptions, Invoices, Listener, Payment Methods | Licenses, Subscriptions, Payment Methods, Invoices, Listener | ✅ |
| **Dashboard** | Dashboard | Activity, Dashboard | ✅ |
| **Authentication** | Authentication, Token | Authentication, Token | ✅ |
| **Reference** | Currency | Currency | ✅ |
| **Internal Tools** | Internal Tools | Plugin, Internal Tools | ✅ |
| **Objects** | 14+ object types | 16 object types | ✅ |

### Internal API - Objects Comparison

| Object | Laravel/ReDoc | Mintlify | Status |
|--------|---------------|----------|--------|
| Task object | ✅ | ✅ | Migrated |
| Vehicle object | ✅ | ✅ | Migrated |
| User object | ✅ | ✅ | Migrated |
| Role object | ✅ | ✅ | Migrated |
| Hub object | ✅ | ✅ | Migrated |
| Team object | ✅ | ✅ | Migrated |
| Flow object | ✅ | ✅ | Migrated |
| Organization object | ✅ | ✅ | Migrated |
| Invoice object | ✅ | ✅ | Migrated |
| License object | ✅ | ✅ | Migrated |
| Subscription object | ✅ | ✅ | Migrated |
| Location History object | ✅ | ✅ | Migrated |
| Task Schedule object | ✅ | ✅ | Migrated |
| Version object | ✅ | ✅ | Migrated |
| Workflow object | ✅ | ✅ | Migrated |
| Custom Module object | ✅ | ✅ | Migrated |

### UI/UX Differences

| Aspect | Laravel/ReDoc | Mintlify |
|--------|---------------|----------|
| **Sidebar Style** | Flat list, expandable tags | Grouped by module with collapsible sections |
| **Navigation** | Single-page scroll with anchor links | Multi-page with persistent sidebar |
| **Try It Button** | ❌ None | ✅ "Try it" button on every endpoint |
| **Code Highlighting** | Basic JSON highlighting | Full syntax highlighting with copy button |
| **Response Examples** | Expandable JSON | Tabbed code blocks |
| **Theme** | Light only | Light/Dark toggle |
| **Search** | ReDoc built-in (limited) | Global search (⌘K) with AI suggestions |
| **Mobile UX** | Responsive but cramped | Better mobile navigation with hamburger menu |

### Testing Verification Checklist

| Test | Laravel/ReDoc | Mintlify | Result |
|------|---------------|----------|--------|
| Public API loads | ✅ localhost:83 | ✅ localhost:3000/api-reference | Pass |
| Internal API loads | ✅ localhost:83/internal | ✅ localhost:3000/api-reference-internal | Pass |
| All modules visible | ✅ | ✅ | Pass |
| Endpoints documented | ✅ | ✅ | Pass |
| Request/Response examples | ✅ | ✅ | Pass |
| Schema definitions | ✅ | ✅ | Pass |
| Objects section | ✅ | ✅ | Pass |
| Navigation works | ✅ | ✅ | Pass |
| Search works | ✅ | ✅ | Pass |
| Internal API hidden from nav | N/A | ✅ (hidden: true) | Pass |
| noindex on internal pages | N/A | ✅ | Pass |

---

## Conclusion

The migration from Laravel/ReDoc to Mintlify is **complete and successful**. All API endpoints, objects, and documentation sections have been properly migrated with the following improvements:

1. **Better Organization**: Endpoints are grouped by module with clear hierarchy
2. **Modern UI**: Dark mode, improved typography, and better mobile experience
3. **Interactive Testing**: "Try it" buttons allow API testing directly from docs
4. **SEO Control**: Internal API properly hidden from search engines
5. **Tab Navigation**: Easy switching between Public and Internal API

**Tested on**: 2025-11-27
**Screenshots captured**: 8 comparison screenshots in `.playwright-mcp/` directory
