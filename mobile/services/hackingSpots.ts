import axios from 'axios';

export interface HackingSpot {
  id: number;
  public_id: string;
  name: string;
  latitude: number;
  longitude: number;
  difficulty: string;
}

const BASE_URL = 'https://travelroot-box.baptistegrimaldi.com';

export async function fetchHackingSpots(lat: number, long: number): Promise<HackingSpot[]> {
  const response = await axios.get(`${BASE_URL}/hacking-spots/localisation`, {
    params: { lat, long },
  });
  return response.data;
}

export async function fetchHackingSpot(id: number): Promise<HackingSpot> {
  const response = await axios.get(`${BASE_URL}/hacking-spots/${id}`);
  return response.data;
}
