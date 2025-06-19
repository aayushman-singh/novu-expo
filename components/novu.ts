const NOVU_API_KEY = "65003266b78a2f35a272af937c435bea"; 
const NOVU_API_URL = "https://api.novu.co/v1"; // Updated base URL

export async function registerExpoTokenWithNovu(
  subscriberId: string,
  expoPushToken: string
) {
  try {
    console.log("A. Starting Novu registration for subscriber:", subscriberId);
    console.log("B. Using token:", expoPushToken);
    
    // First, create or update the subscriber
    console.log("C. Creating/updating subscriber in Novu...");
    const createResponse = await fetch(`${NOVU_API_URL}/subscribers`, {
      method: 'POST',
      headers: {
        'Authorization': `ApiKey ${NOVU_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriberId,
        firstName: subscriberId,
      }),
    });
    
    const createData = await createResponse.json();
    console.log("D. Subscriber creation response:", createData);

    // Then, set the Expo push token for the subscriber using the correct endpoint
    console.log("E. Setting Expo credentials for subscriber...");
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
    console.log("F. Credentials set response:", credentialsData);
  } catch (error: any) {
    console.error("G. Error in Novu registration:", {
      message: error.message,
      error: error
    });
    throw error;
  }
}
