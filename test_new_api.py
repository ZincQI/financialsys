import requests
import json

# Test API endpoints
BASE_URL = "http://localhost:5000/api"

print("Testing new API endpoints...")

# Test 1: Get all purchase orders
print("\n1. Testing GET /purchase-orders")
try:
    response = requests.get(f"{BASE_URL}/purchase-orders")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

# Test 2: Get all vendors
try:
    print("\n2. Testing GET /vendors")
    response = requests.get(f"{BASE_URL}/vendors")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

print("\nNew API testing completed!")
