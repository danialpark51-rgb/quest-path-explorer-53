import os
import requests

# Pull the API key safely from your Replit Secrets
API_KEY = os.environ.get('GNEWS_API_KEY')

# Define what you want to search for
query = "technology"
url = f"https://gnews.io/api/v4/search?q={query}&lang=en&max=5&apikey={API_KEY}"

print("Fetching latest news articles...")

# Make the request to GNews
response = requests.get(url)

# Print the results
if response.status_code == 200:
    data = response.json()
    articles = data.get('articles', [])

    print(f"\nSuccessfully found {len(articles)} articles:\n")
    for index, article in enumerate(articles, 1):
        print(f"{index}. {article['title']}")
        print(f"   Link: {article['url']}\n")
else:
    print(f"Error: {response.status_code}")
    print(response.text)
