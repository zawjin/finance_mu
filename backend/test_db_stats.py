import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import certifi

async def test():
    client = AsyncIOMotorClient(
        "mongodb+srv://finance_mu:KIDEWjxBv1TLLyWd@cluster0.xdlsefg.mongodb.net/admin?retryWrites=true&loadBalanced=false&replicaSet=atlas-2rctht-shard-0&readPreference=secondaryPreferred&srvServiceName=mongodb&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1", 
        tlsCAFile=certifi.where()
    )
    db = client["FIN_MU"]
    stats = await db.command("dbstats")
    print(stats)

asyncio.run(test())
