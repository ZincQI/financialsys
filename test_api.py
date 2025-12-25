import requests
import json

# Test API endpoints
BASE_URL = "http://localhost:5000/api"

print("Testing API endpoints...")

# Test 1: Get account tree
print("\n1. Testing GET /accounts/tree")
response = requests.get(f"{BASE_URL}/accounts/tree")
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

# Test 2: Get all accounts
print("\n2. Testing GET /accounts")
response = requests.get(f"{BASE_URL}/accounts")
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

# Test 3: Get dashboard data
print("\n3. Testing GET /reports/dashboard")
response = requests.get(f"{BASE_URL}/reports/dashboard")
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

# Test 4: Get balance sheet
print("\n4. Testing GET /reports/balance-sheet")
response = requests.get(f"{BASE_URL}/reports/balance-sheet?date=2023-12-31")
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

# Test 5: Get income statement
print("\n5. Testing GET /reports/income-statement")
response = requests.get(f"{BASE_URL}/reports/income-statement?start_date=2023-01-01&end_date=2023-12-31")
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

print("\nAPI testing completed!")
