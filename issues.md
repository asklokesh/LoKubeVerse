# Issues Identified During End-to-End Testing

## Backend Issues
1. **Kubernetes Config Error:**
   - Error: "Could not load Kubernetes config: Invalid kube-config file. No configuration found."
   - Cause: Missing or misconfigured Kubernetes configuration file.
   - Impact: Backend cannot interact with the Kubernetes cluster.

2. **Pydantic Warning:**
   - Warning: "Valid config keys have changed in V2: 'orm_mode' has been renamed to 'from_attributes'."
   - Cause: Deprecated configuration in Pydantic models.
   - Impact: Potential future compatibility issues.

3. **`/api/tenants/{tenant_id}` Endpoint Error:**
   - Error: "Internal Server Error"
   - Cause: Likely an issue with the database query or tenant ID handling.
   - Impact: Unable to retrieve tenant details.

4. **`/api/users/{user_id}` Endpoint Error:**
   - Error: "Internal Server Error"
   - Cause: Likely an issue with the database query or user ID handling.
   - Impact: Unable to retrieve user details.

5. **`/api/users/` Endpoint Validation Error:**
   - Error: "Field required: 'password'"
   - Cause: Missing required field `password` in the request payload.
   - Impact: Unable to create a new user without providing a password.

6. **`/api/tenants/{tenant_id}` Endpoint Input Validation:**
   - Issue: The endpoint fails with a `500 Internal Server Error` when an invalid UUID is provided.
   - Cause: The `tenant_id` parameter must be a valid UUID.
   - Resolution: Updated error handling to validate UUIDs and return appropriate error messages.

7. **`/api/users/{user_id}` Endpoint Behavior:**
   - Observation: The endpoint returns `404 Not Found` when the user ID does not exist in the database.
   - Cause: The user ID provided must correspond to an existing user.
   - Resolution: No changes needed; the behavior is correct. Ensure documentation clarifies this requirement.

## Frontend Issues
1. **Invalid `next.config.js` Options:**
   - Warning: "Unrecognized key(s) in object: 'appDir' at 'experimental'."
   - Cause: Misconfigured `next.config.js` file.
   - Impact: May cause unexpected behavior in the frontend.

2. **Frontend Running on Port 3001:**
   - Observation: Frontend is running on port 3001 instead of the expected 3000.
   - Cause: Port conflict or misconfiguration.
   - Impact: Mismatch with the expected setup in `docker-compose.yml`.

## RabbitMQ Issues
1. **End-of-Life Warning:**
   - Warning: "This release series has reached end of life and is no longer supported."
   - Cause: Outdated RabbitMQ version.
   - Impact: Security and compatibility risks.

## General Observations
- All services are starting successfully, but the above issues need to be addressed for a fully functional setup.

---

# Plan for Fixing Issues

## Step 1: Fix Backend Issues
- [ ] Add a valid Kubernetes configuration file or mock configuration for local testing.
- [ ] Update Pydantic models to use `from_attributes` instead of `orm_mode`.

## Step 2: Fix Frontend Issues
- [ ] Remove or correct the `appDir` key in `next.config.js`.
- [ ] Update the frontend service to run on port 3000 as expected.

## Step 3: Fix RabbitMQ Issues
- [ ] Update the RabbitMQ image to a supported version.

## Step 4: Retest
- [ ] Perform end-to-end testing again to verify fixes.

---

# Notes
- Ensure all fixes are tested locally before committing changes.
- Document any additional issues found during retesting.
