import urllib.request
import urllib.error
import json

def main():
    API_KEY = "AIzaSyBj-FW_1hqi5Lq7ovb_qdtq6wkZ8GdVx4U"
    # Using searchText for simplicity rather than searchNearby
    URL = "https://places.googleapis.com/v1/places:searchText"

    # Define the fields to return
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.primaryTypeDisplayName,places.photos,places.currentOpeningHours.openNow"
    }

    data = {
        "textQuery": "best restaurants in Barrie, ON",
        "pageSize": 20 # Fetch 20 restaurants for a full list
    }

    print("Fetching data from Google Places API...")
    req = urllib.request.Request(URL, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                results = json.loads(response.read().decode('utf-8'))
                
                # Add a photoUrl to each place that has photos
                for place in results.get('places', []):
                    if 'photos' in place and len(place['photos']) > 0:
                        photo_name = place['photos'][0]['name']
                        place['photoUrl'] = f"https://places.googleapis.com/v1/{photo_name}/media?maxHeightPx=800&maxWidthPx=800&key={API_KEY}"
                    else:
                        place['photoUrl'] = "https://via.placeholder.com/800x600?text=No+Image"

                with open("places.json", "w") as f:
                    json.dump(results, f, indent=2)
                print("Successfully fetched places data and saved to places.json")
            else:
                print("Error:", response.status)
    except urllib.error.URLError as e:
        print("Error fetching data:", e.reason)

if __name__ == "__main__":
    main()
