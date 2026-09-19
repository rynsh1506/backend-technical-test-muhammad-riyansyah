import urllib.request
try:
    req = urllib.request.Request("https://raw.githubusercontent.com/elysiajs/documentation/main/docs/patterns/drizzle.md", headers={'User-Agent': 'Mozilla/5.0'})
    print(urllib.request.urlopen(req).read().decode('utf-8'))
except Exception as e:
    print("Pattern:", e)
try:
    req2 = urllib.request.Request("https://raw.githubusercontent.com/elysiajs/documentation/main/docs/recipes/drizzle.md", headers={'User-Agent': 'Mozilla/5.0'})
    print(urllib.request.urlopen(req2).read().decode('utf-8'))
except Exception as e:
    print("Recipe:", e)
