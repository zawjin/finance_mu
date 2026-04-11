import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def clean():
    client = AsyncIOMotorClient("mongodb+srv://finance_mu:KIDEWjxBv1TLLyWd@cluster0.xdlsefg.mongodb.net/admin?retryWrites=true&loadBalanced=false&replicaSet=atlas-2rctht-shard-0&readPreference=secondaryPreferred&srvServiceName=mongodb&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1")
    db = client.FIN_MU
    
    # List collections before
    cols = await db.list_collection_names()
    print(f"Collections before: {cols}")
    
    # Hard drop legacy collections
    await db.drop_collection("cards")
    await db.drop_collection("bill_settlements")
    
    # List collections after
    cols_after = await db.list_collection_names()
    print(f"Collections after: {cols_after}")
    print("HARD CLEANUP SUCCESSFUL: Legacy data purged.")
    client.close()

if __name__ == "__main__":
    asyncio.run(clean())
