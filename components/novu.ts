const NOVU_API_KEY = "65003266b78a2f35a272af937c435bea"; 
const NOVU_API_KEY_LOCAL = "188c28ed7ca51466a15a56e012cc7bc4";
const NOVU_API_URL = "https://api.novu.co/v1"; // Updated base URL
const LOCAL_API_URL = "http://192.168.18.34:3000"; // Using PC's IP address instead of localhost

export async function registerExpoTokenWithNovu(
  subscriberId: string,
  expoPushToken: string
) {
  try {
    console.log("A. Starting Novu registration for subscriber:", subscriberId);
    console.log("B. Using token:", expoPushToken);
    
    // Register with both Novu API and local server in parallel 
    const [novuResult, localResult] = await Promise.allSettled([
      registerWithNovuAPI(subscriberId, expoPushToken),
      registerWithLocalServer("9u1EfWoW0Zph", expoPushToken)
    ]);

    // Log results
    if (novuResult.status === 'fulfilled') {
      console.log("D. Novu API registration successful");
    } else {
      console.error("D. Novu API registration failed:", novuResult.reason);
    }

    if (localResult.status === 'fulfilled') {
      console.log("E. Local server registration successful");
    } else {
      console.error("E. Local server registration failed:", localResult.reason);
    }

  } catch (error: any) {
    console.error("F. Error in registration process:", {
      message: error.message,
      error: error
    });
    throw error;
  }
}

async function registerWithNovuAPI(subscriberId: string, expoPushToken: string) {
  console.log("C1. Creating/updating subscriber in Novu API...");
  
  // First, create or update the subscriber
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
  console.log("C2. Novu subscriber creation response:", createData);

  // Then, set the Expo push token for the subscriber
  console.log("C3. Setting Expo credentials for subscriber in Novu...");
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
  console.log("C4. Novu credentials set response:", credentialsData);
  
  return { createData, credentialsData };
}

async function registerWithLocalServer(subscriberId: string, expoPushToken: string) {
  console.log("C5. Registering with local server...");
  console.log("C5f. Using API key:", NOVU_API_KEY_LOCAL); // Debug: show what API key is being used
  
  try {
    const localResponse = await fetch(`${LOCAL_API_URL}/v2/subscribers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOVU_API_KEY_LOCAL}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriberId,
        email: `${subscriberId}@example.com`, // Generate email from subscriberId
        firstName: subscriberId,
        lastName: "User",
      }),
    });
    
    console.log("C5a. Local server response status:", localResponse.status);
    console.log("C5b. Local server response headers:", Object.fromEntries(localResponse.headers.entries()));
    
    if (!localResponse.ok) {
      const errorText = await localResponse.text();
      console.log("C5c. Local server error response body:", errorText);
      throw new Error(`Local server registration failed: ${localResponse.status} ${localResponse.statusText} - ${errorText}`);
    }
    
    const localData = await localResponse.json();
    console.log("C6. Local server registration response:", localData);
    
    return localData;
  } catch (error: any) {
    console.log("C5d. Local server fetch error:", error.message);
    console.log("C5e. Full error object:", error);
    throw error;
  }
}
