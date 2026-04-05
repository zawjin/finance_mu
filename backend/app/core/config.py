import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FRIDAY Enterprise Finance API"
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb+srv://finance_mu:KIDEWjxBv1TLLyWd@cluster0.xdlsefg.mongodb.net/admin?retryWrites=true&loadBalanced=false&replicaSet=atlas-2rctht-shard-0&readPreference=secondaryPreferred&srvServiceName=mongodb&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1")
    DB_NAME: str = os.getenv("DB_NAME", "FIN_MU")
    
    # EXTERNAL NEURAL DATA SOURCES
    SCREENER_BASE_URL: str = "https://www.screener.in/company/"
    YAHOO_FINANCE_URL: str = "https://query1.finance.yahoo.com/v8/finance/chart/"
    MF_SEARCH_URL: str = "https://api.mfapi.in/mf/search?q="
    MF_LATEST_URL: str = "https://api.mfapi.in/mf/"

settings = Settings()
