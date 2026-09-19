import urllib.request
import json
url = 'https://api.github.com/search/code?q=drizzle-typebox+repo:elysiajs/elysia'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    response = urllib.request.urlopen(req)
    print(response.read().decode('utf-8'))
except Exception as e:
    print(e)
