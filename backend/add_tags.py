import re

groups = {
    "/daily-quote": "Dashboard & Analytics",
    "/summary": "Dashboard & Analytics",
    "/ai-insights": "Dashboard & Analytics",
    "/market-price": "Dashboard & Analytics",
    "/mf-search": "Dashboard & Analytics",
    "/mf-nav": "Dashboard & Analytics",
    "/sync-prices": "Dashboard & Analytics",
    "/spending": "Transactions & Ledger",
    "/investments": "Investments & Assets",
    "/reserves": "Reserves & Accounts",
    "/categories": "System Configuration",
    "/asset_classes": "System Configuration",
    "/debt": "Debt Ledger",
    "/yearly-expenses": "Fixed Expenses",
    "/private-lending": "Private Lending",
    "/health/habits": "Health & Wellbeing",
    "/health/logs": "Health & Wellbeing"
}

with open("app/api/endpoints.py", "r") as f:
    content = f.read()

def replacer(match):
    method = match.group(1)
    route = match.group(2)
    # find tag
    tag = "General"
    for prefix, g in groups.items():
        if route.startswith(prefix):
            tag = g
            break
    
    return f'@router.{method}("{route}", tags=["{tag}"])'

# Match @router.get("/something")
new_content = re.sub(r'@router\.(get|post|put|delete)\("([^"]+)"\)', replacer, content)

with open("app/api/endpoints.py", "w") as f:
    f.write(new_content)

print("Added tags successfully.")
