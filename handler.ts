import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';

const mockSights = [
  { id: '1', name: 'Newport Cliff Walk', description: 'Scenic 3.5-mile walkway in Newport.', latitude: 41.4914, longitude: -71.3128, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/78/Cliff_Walk_-_Newport%2C_Rhode_Island%2C_USA_-_August_15%2C_2015_03.jpg" },
  { id: '2', name: 'Roger Williams Park', description: 'Urban park with zoo and gardens.', latitude: 41.8184, longitude: -71.4236, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Bandstand_and_Casino%2C_Roger_Williams_Park%2C_Providence%2C_Rhode_Island.jpg" }
];

const client = new DynamoDBClient({ region: 'us-east-1' });

export const getSights: APIGatewayProxyHandler = async (): Promise<APIGatewayProxyResult> => {
  try {
    let sights;
    if (USE_MOCK_DATA) {
      console.log("Using mock data");
      sights = mockSights;
    } else {
      console.log("Fetching from DynamoDB");
      const command = new ScanCommand({ TableName: 'RISightseeingSights' });
      const response = await client.send(command);
      sights = response.Items?.map(item => unmarshall(item)) || [];
    }

    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",              // REQUIRED for GET CORS
        "Access-Control-Allow-Headers": "*",             // Optional, safe
        "Access-Control-Allow-Methods": "OPTIONS,GET",  // Optional, safe
      },
      body: JSON.stringify(sights),
    };

    console.log("Returning response:", JSON.stringify(response));
    return response;

  } catch (error) {
    console.error("Error fetching sights:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",              // REQUIRED for error CORS
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET",
      },
      body: JSON.stringify({ message: "Internal Server Error", error }),
    };
  }
};
