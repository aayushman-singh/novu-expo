// API Keys Configuration

export const API_CONFIG = {
  // Novu Configuration
  novu: {
    apiKey: "65003266b78a2f35a272af937c435bea",
    apiUrl: "https://api.novu.co/v1",
    environmentId: "683fca0b039a2254a15d8c05",
  },

  // Local Server Configuration
  localServer: {
    apiKey: "51f9cf6dfe05ff1ec1ba06785b43f8ef",
    url: "http://192.168.18.34:3000", // Update with your actual IP
    endpoint: "/v1/subscribers",
    integrationId: "expo-push", // Expo integration ID
  },
};

// Helper function to get masked API key for logging
export const getMaskedApiKey = (apiKey: string): string => {
  return apiKey.substring(0, 8) + "...";
};

// Helper function to validate API key format
export const isValidApiKey = (apiKey: string): boolean => {
  return Boolean(apiKey && apiKey.length >= 32);
}; 