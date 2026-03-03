export async function createVideoSDKMeeting(): Promise<string> {
  try {
    const response = await fetch("https://api.videosdk.live/v2/rooms", {
      method: "POST",
      headers: {
        authorization: process.env.VIDEOSDK_API_TOKEN!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomType: "CONFERENCE",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("VideoSDK API error:", error);
      throw new Error(`Failed to create meeting: ${response.statusText}`);
    }

    const data = (await response.json()) as { roomId: string };
    return data.roomId;
  } catch (error) {
    console.error("Error creating VideoSDK meeting:", error);
    throw error;
  }
}

export async function initializeMeetingConfig(
  roomId: string,
  token: string
): Promise<{ meetingId: string }> {
  try {
    const response = await fetch(
      "https://api.videosdk.live/infra/v1/meetings/init-config",
      {
        method: "POST",
        headers: {
          authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId,
          userId: "sdk",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Init config error:", error);
      throw new Error(`Failed to initialize meeting: ${response.statusText}`);
    }

    const data = (await response.json()) as { meetingId: string };
    return data;
  } catch (error) {
    console.error("Error initializing meeting config:", error);
    throw error;
  }
}
