import { API_CONFIG, getMaskedApiKey, isValidApiKey } from '@/config/api-keys';

// Extract configuration
const NOVU_API_KEY = API_CONFIG.novu.apiKey;
const NOVU_API_URL = API_CONFIG.novu.apiUrl;
const NOVU_ENVIRONMENT_ID = API_CONFIG.novu.environmentId;

const LOCAL_SERVER_URL = API_CONFIG.localServer.url;
const LOCAL_SERVER_ENDPOINT = API_CONFIG.localServer.endpoint;
const LOCAL_SERVER_API_KEY = API_CONFIG.localServer.apiKey;

export async function registerExpoTokenWithNovu(
  subscriberId: string,
  expoPushToken: string,
  userData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }
) {
  // Validate API key
  if (!isValidApiKey(NOVU_API_KEY)) {
    throw new Error("Invalid Novu API key");
  }
  
  try {
    console.log("A. Starting Novu registration for subscriber:", subscriberId);
    console.log("B. Using token:", expoPushToken);
    console.log("C. Using environment ID:", NOVU_ENVIRONMENT_ID);
    console.log("C1. Using Novu API key:", getMaskedApiKey(NOVU_API_KEY));
    
    // First, create or update the subscriber
    console.log("D. Creating/updating subscriber in Novu...");
    const createResponse = await fetch(`${NOVU_API_URL}/subscribers`, {
      method: 'POST',
      headers: {
        'Authorization': `ApiKey ${NOVU_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriberId,
        firstName: userData?.firstName || subscriberId,
        lastName: userData?.lastName || '',
        email: userData?.email || '',
        phone: userData?.phone || '',
        environmentId: NOVU_ENVIRONMENT_ID,
      }),
    });
    
    const createData = await createResponse.json();
    console.log("E. Subscriber creation response:", createData);

    // Then, set the Expo push token for the subscriber using the correct endpoint
    console.log("F. Setting Expo credentials for subscriber...");
    const credentialsResponse = await fetch(`${NOVU_API_URL}/subscribers/${subscriberId}/credentials`, {
      method: 'PUT',
      headers: {
        'Authorization': `ApiKey ${NOVU_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        providerId: 'expo',
        credentials: {
          deviceTokens: [expoPushToken],
        },
      }),
    });
    
    const credentialsData = await credentialsResponse.json();
    console.log("G. Credentials set response:", credentialsData);
    
    // Check if credentials were set successfully
    if (!credentialsResponse.ok) {
      console.error("G1. Failed to set credentials:", credentialsData);
      throw new Error(`Failed to set credentials: ${credentialsData.message || 'Unknown error'}`);
    }
    
    // Verify the subscriber has the expo channel configured
    console.log("H. Verifying subscriber channels...");
    const subscriberResponse = await fetch(`${NOVU_API_URL}/subscribers/${subscriberId}`, {
      method: 'GET',
      headers: {
        'Authorization': `ApiKey ${NOVU_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (subscriberResponse.ok) {
      const subscriberData = await subscriberResponse.json();
      console.log("I. Subscriber data:", subscriberData);
      console.log("I1. Subscriber channels:", subscriberData.data?.channels || []);
      
      // Check if expo channel is configured
      const hasExpoChannel = subscriberData.data?.channels?.some((channel: any) => 
        channel.providerId === 'expo' || channel.providerId === 'expo-push'
      );
      
      if (hasExpoChannel) {
        console.log("I2. ✅ Expo channel is properly configured");
      } else {
        console.log("I2. ❌ Expo channel is NOT configured - this may cause test workflow issues");
      }
    } else {
      console.log("I. Could not verify subscriber channels");
    }
  } catch (error: any) {
    console.error("J. Error in Novu registration:", {
      message: error.message,
      error: error
    });
    throw error;
  }
}

// Function to manually update subscriber channels
export async function updateSubscriberChannels(subscriberId: string) {
  try {
    console.log("CHANNELS_A. Manually updating subscriber channels for:", subscriberId);
    
    const updateResponse = await fetch(`${NOVU_API_URL}/subscribers/${subscriberId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `ApiKey ${NOVU_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channels: [
          {
            providerId: 'expo',
            credentials: {
              deviceTokens: [] // Will be populated by credentials endpoint
            }
          }
        ]
      }),
    });
    
    const updateData = await updateResponse.json();
    console.log("CHANNELS_B. Channel update response:", updateData);
    
    return updateData;
  } catch (error: any) {
    console.error("CHANNELS_C. Error updating channels:", error);
    throw error;
  }
}

// Function to send subscriber data to local server
export async function sendToLocalServer(
  subscriberId: string,
  expoPushToken: string,
  userData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }
) {
  // Validate API key
  if (!isValidApiKey(LOCAL_SERVER_API_KEY)) {
    throw new Error("Invalid local server API key");
  }
  
  try {
    console.log("LOCAL_SERVER_A. Starting local server registration for subscriber:", subscriberId);
    console.log("LOCAL_SERVER_B. Using token:", expoPushToken);
    console.log("LOCAL_SERVER_C. Using local server URL:", LOCAL_SERVER_URL);
    console.log("LOCAL_SERVER_C1. Using local server API key:", getMaskedApiKey(LOCAL_SERVER_API_KEY));
    
    const payload = {
      subscriberId,
      expoPushToken,
      firstName: userData?.firstName || subscriberId,
      lastName: userData?.lastName || '',
      email: userData?.email || '',
      phone: userData?.phone || '',
      timestamp: new Date().toISOString(),
      source: 'expo-app'
    };
    
    console.log("LOCAL_SERVER_D. Sending payload to local server:", payload);
    
    const response = await fetch(`${LOCAL_SERVER_URL}${LOCAL_SERVER_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Authorization': `ApiKey ${LOCAL_SERVER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    console.log("LOCAL_SERVER_E. Local server response status:", response.status);
    console.log("LOCAL_SERVER_F. Local server response headers:", Object.fromEntries(response.headers.entries()));
    
    const responseData = await response.json();
    console.log("LOCAL_SERVER_G. Local server response data:", responseData);
    
    if (response.ok) {
      console.log("LOCAL_SERVER_H. Successfully sent data to local server");
    } else {
      console.log("LOCAL_SERVER_I. Local server returned error status:", response.status);
    }
    
    return { success: response.ok, data: responseData, status: response.status };
  } catch (error: any) {
    console.error("LOCAL_SERVER_J. Error sending to local server:", {
      message: error.message,
      error: error
    });
    return { success: false, error: error.message };
  }
}

// Combined function to register with both Novu and local server
export async function registerWithBothServices(
  subscriberId: string,
  expoPushToken: string,
  userData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }
) {
  console.log("COMBINED_A. Starting registration with both services for subscriber:", subscriberId);
  
  // Separate logic flows for each service
  let novuSuccess = false;
  try {
    await registerExpoTokenWithNovu(subscriberId, expoPushToken, userData);
    console.log("COMBINED_B. Novu registration completed successfully");
    novuSuccess = true;
  } catch (error) {
    console.log("COMBINED_B. Novu registration failed:", error);
    
    // Try to manually update channels if registration failed
    try {
      console.log("COMBINED_B1. Attempting to manually update channels...");
      await updateSubscriberChannels(subscriberId);
      console.log("COMBINED_B2. Manual channel update completed");
      novuSuccess = true;
    } catch (channelError) {
      console.log("COMBINED_B3. Manual channel update also failed:", channelError);
    }
  }
  
  const localServerResult = await sendToLocalServer(subscriberId, expoPushToken, userData);
  console.log("COMBINED_C. Local server registration result:", localServerResult);
  
  return {
    novu: { success: novuSuccess },
    localServer: localServerResult,
    overallSuccess: novuSuccess && localServerResult.success
  };
}

// Utility function for testing with different user data
export const testUserData = {
  johnDoe: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1234567890"
  },
  janeSmith: {
    firstName: "Jane",
    lastName: "Smith", 
    email: "jane.smith@example.com",
    phone: "+1987654321"
  },
  bobWilson: {
    firstName: "Bob",
    lastName: "Wilson",
    email: "bob.wilson@example.com", 
    phone: "+1555123456"
  }
};
