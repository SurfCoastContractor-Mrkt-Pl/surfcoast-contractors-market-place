/**
 * Environment configuration for dynamic URLs across staging/production
 * Centralizes all hardcoded URLs for easier maintenance
 */

export const getAppBaseUrl = () => {
  return import.meta.env.VITE_APP_BASE_URL || window.location.origin;
};

export const getComplianceUrl = () => {
  return import.meta.env.VITE_COMPLIANCE_URL || `${getAppBaseUrl()}/functions/submitComplianceAck`;
};

export const getComplianceCheckUrl = () => {
  return import.meta.env.VITE_COMPLIANCE_CHECK_URL || `${getAppBaseUrl()}/functions/getLocationCompliance`;
};

export const getVerifyLicenseUrl = () => {
  return import.meta.env.VITE_VERIFY_LICENSE_URL || `${getAppBaseUrl()}/functions/verifyLicense`;
};